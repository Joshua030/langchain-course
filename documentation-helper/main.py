from typing import Any, Dict, List

import streamlit as st

from backend.core import run_llm


def _format_sources(context_docs: List[Any]) -> List[str]:
    return [
        str(meta.get("source") or "Unknown")
        for doc in (context_docs or [])
        if(meta := (getattr(doc, "metadata", None) or {})) is not None
    ]

st.set_page_config(page_title="LangChain Documentation Helper", page_icon="📚", layout="centered")
# pipenv run streamlit run main.py // command to run
   