async def run_noc_operator(question):

    return {
        "agent": "noc-operator",
        "question": question,
        "tools": [
            "prometheus",
            "loki"
        ]
    }
