async def run_gitops_operator(question):

    return {
        "agent": "gitops-operator",
        "question": question,
        "tools": [
            "github",
            "argocd"
        ]
    }
