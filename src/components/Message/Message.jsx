import { AlertCircle, CheckCircle } from 'lucide-react';

const Message = ({message}) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-2">
        <div className={`flex items-center p-3 rounded-lg ${
        message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
        {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 mr-2" />
        ) : (
            <AlertCircle className="w-5 h-5 mr-2" />
        )}
        {message.text} 
        </div>
    </div>
  )
}

export default Message