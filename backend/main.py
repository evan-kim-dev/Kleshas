"""
번뇌 MVP — FastAPI + LangChain RAG backend
Cyber Monk AI: witty, blunt, empathetic Buddhist scripture advice
"""

from __future__ import annotations

import os
from contextlib import asynccontextmanager
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from pydantic import BaseModel, Field, field_validator
from pydantic_settings import BaseSettings

load_dotenv()

# ── Buddhist scripture corpus (MVP hardcoded) ──────────────────────────────

SCRIPTURES: list[dict[str, str]] = [
    {
        "source": "법구경 5게",
        "text": "분노를 이기지 못하면 분노가 이긴다. 분노를 이기면 이긴 것이다. 자신을 다스리는 자가 진정한 승리자다.",
    },
    {
        "source": "반야심경",
        "text": "색즉시공 공즉시색. 모든 것은 인연에 의해 생기고, 인연이 끊어지면 사라진다. 집착이 고통의 뿌리다.",
    },
    {
        "source": "금강경",
        "text": "과거심 불가득 현재심 불가득 미래심 불가득. 마음은 잡히지 않는다. 잡히지 않는 마음이 평화다.",
    },
    {
        "source": "유마경",
        "text": "번뇌即菩提. 번뇌 자체가 깨달음의 씨앗이다. 고통을 피하지 말고 들여다보라.",
    },
]

CHROMA_DIR = Path(__file__).parent / "chroma_db"

SYSTEM_PROMPT = """당신은 "사이버 스님" — 번뇌 앱의 AI 멘탈 케어 상담사다.

성격:
- Gen Z 말투로 위트 있고 살짝 직설적이지만, 깊은 공감을 담는다
- 불교 경전의 지혜를 현대적 언어로 풀어 설명한다
- 판단하지 않고, 유머와 따뜻함으로 위로한다
- 이모지는 적당히 (1~2개)

규칙:
- 아래 경전 맥락을 참고하되, 직접 인용보다 자연스럽게 녹여낸다
- 의학적·법률적 조언은 하지 않는다. 심각한 경우 전문가 상담을 권한다
- 200자 이내로 간결하게 답한다

경전 맥락:
{context}
"""


# ── Settings & validation ──────────────────────────────────────────────────


class Settings(BaseSettings):
    llm_provider: str = Field(default="openai", alias="LLM_PROVIDER")
    openai_api_key: str = Field(default="", alias="OPENAI_API_KEY")
    google_api_key: str = Field(default="", alias="GOOGLE_API_KEY")
    cors_origins: str = Field(
        default="http://localhost:3000,http://127.0.0.1:3000",
        alias="CORS_ORIGINS",
    )

    model_config = {"env_file": ".env", "extra": "ignore"}

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=500)

    @field_validator("message")
    @classmethod
    def strip_and_validate(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("메시지가 비어 있습니다.")
        return stripped


class ChatResponse(BaseModel):
    reply: str
    sources: list[str]


# ── RAG setup ──────────────────────────────────────────────────────────────

vectorstore: Chroma | None = None
rag_chain = None


def _build_embeddings(settings: Settings):
    if settings.llm_provider == "gemini":
        if not settings.google_api_key:
            raise RuntimeError("GOOGLE_API_KEY가 설정되지 않았습니다.")
        from langchain_google_genai import GoogleGenerativeAIEmbeddings

        return GoogleGenerativeAIEmbeddings(
            model="models/text-embedding-004",
            google_api_key=settings.google_api_key,
        )

    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY가 설정되지 않았습니다.")
    from langchain_openai import OpenAIEmbeddings

    return OpenAIEmbeddings(
        model="text-embedding-3-small",
        openai_api_key=settings.openai_api_key,
    )


def _build_llm(settings: Settings):
    if settings.llm_provider == "gemini":
        from langchain_google_genai import ChatGoogleGenerativeAI

        return ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=settings.google_api_key,
            temperature=0.8,
        )

    from langchain_openai import ChatOpenAI

    return ChatOpenAI(
        model="gpt-4o-mini",
        openai_api_key=settings.openai_api_key,
        temperature=0.8,
    )


def _init_rag(settings: Settings):
    global vectorstore, rag_chain

    documents = [
        Document(page_content=s["text"], metadata={"source": s["source"]})
        for s in SCRIPTURES
    ]

    embeddings = _build_embeddings(settings)
    vectorstore = Chroma.from_documents(
        documents=documents,
        embedding=embeddings,
        persist_directory=str(CHROMA_DIR),
    )

    retriever = vectorstore.as_retriever(search_kwargs={"k": 2})
    llm = _build_llm(settings)

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", SYSTEM_PROMPT),
            ("human", "{question}"),
        ]
    )

    def format_docs(docs: list[Document]) -> str:
        return "\n\n".join(
            f"[{d.metadata.get('source', '경전')}] {d.page_content}" for d in docs
        )

    rag_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    try:
        _init_rag(settings)
    except RuntimeError as e:
        print(f"[WARN] RAG 초기화 실패: {e} — API 키를 .env에 설정하세요.")
    yield


# ── FastAPI app ────────────────────────────────────────────────────────────

settings = get_settings()

app = FastAPI(
    title="번뇌 API",
    description="Cyber Monk AI mental care backend",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "bunnoe-api"}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    if rag_chain is None:
        raise HTTPException(
            status_code=503,
            detail="AI 서비스가 준비되지 않았습니다. backend/.env에 API 키를 설정하세요.",
        )

    try:
        reply = await rag_chain.ainvoke(req.message)
    except Exception:
        raise HTTPException(status_code=502, detail="AI 응답 생성에 실패했습니다.")

    sources: list[str] = []
    if vectorstore:
        docs = vectorstore.similarity_search(req.message, k=2)
        sources = list({d.metadata.get("source", "경전") for d in docs})

    return ChatResponse(reply=reply, sources=sources)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
