export default function OllamaSetup({ onRecheck }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
      <div className="flex items-start gap-3">
        <span className="text-2xl">⚠️</span>
        <div className="flex-1">
          <h3 className="font-semibold text-amber-800 mb-1">Ollama is not running</h3>
          <p className="text-sm text-amber-700 mb-3">
            Speaking and Writing evaluation requires a local Ollama instance with the{' '}
            <strong>gemma4:e4b</strong> model. Reading and Listening work without it.
          </p>
          <ol className="text-sm text-amber-800 space-y-2 mb-4">
            <li>
              <span className="font-medium">1. Install Ollama</span>{' '}
              <a
                href="https://ollama.com"
                target="_blank"
                rel="noreferrer"
                className="underline text-amber-700"
              >
                ollama.com
              </a>
            </li>
            <li>
              <span className="font-medium">2. Start with CORS enabled:</span>
              <code className="block mt-1 bg-amber-100 px-3 py-1.5 rounded font-mono text-xs">
                OLLAMA_ORIGINS=&quot;*&quot; ollama serve
              </code>
            </li>
            <li>
              <span className="font-medium">3. Pull the model:</span>
              <code className="block mt-1 bg-amber-100 px-3 py-1.5 rounded font-mono text-xs">
                ollama pull gemma4:e4b
              </code>
            </li>
          </ol>
          <button
            onClick={onRecheck}
            className="text-sm bg-amber-600 hover:bg-amber-700 text-white px-4 py-1.5 rounded-lg transition-colors"
          >
            Check again
          </button>
        </div>
      </div>
    </div>
  )
}
