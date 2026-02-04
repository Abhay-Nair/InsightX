import { FiCpu, FiLoader } from 'react-icons/fi'
import "./ExplainDatasetButton.css"

function ExplainDatasetButton({ dataset, onExplain, loading }) {
  return (
    <button 
      className="explain-dataset-btn"
      onClick={onExplain}
      disabled={loading}
    >
      {loading ? (
        <>
          <FiLoader className="spinning" />
          Analyzing...
        </>
      ) : (
        <>
          <FiCpu />
          Explain Dataset
        </>
      )}
    </button>
  )
}

export default ExplainDatasetButton