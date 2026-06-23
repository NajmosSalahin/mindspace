import { useState, useEffect } from 'react';
import api from '../../services/axios';
import toast from 'react-hot-toast';

const emptyQuestion = { question: '', type: 'rating', options: ['', ''] };

export default function OrgSurveys() {
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState('');
  const [tab, setTab] = useState('create');
  const [activeSurvey, setActiveSurvey] = useState(null);
  const [results, setResults] = useState(null);
  const [questions, setQuestions] = useState([{ ...emptyQuestion }]);

  useEffect(() => {
    api.get('/events?organizer=me&limit=50').then((res) => setEvents(res.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (eventId) {
      api.get(`/surveys/${eventId}`).then((res) => setActiveSurvey(res.data.data)).catch(() => setActiveSurvey(null));
      api.get(`/surveys/${eventId}/results`).then((res) => setResults(res.data.data)).catch(() => setResults(null));
    }
  }, [eventId]);

  const handleAddQuestion = () => setQuestions([...questions, { ...emptyQuestion }]);

  const handleRemoveQuestion = (i) => {
    if (questions.length > 1) setQuestions(questions.filter((_, idx) => idx !== i));
  };

  const handleQuestionChange = (i, field, value) => {
    const qs = [...questions];
    qs[i][field] = value;
    if (field === 'type' && value !== 'mcq') qs[i].options = ['', ''];
    setQuestions(qs);
  };

  const handleOptionChange = (qi, oi, value) => {
    const qs = [...questions];
    qs[qi].options[oi] = value;
    setQuestions(qs);
  };

  const handleAddOption = (qi) => {
    const qs = [...questions];
    qs[qi].options.push('');
    setQuestions(qs);
  };

  const handleCreate = async () => {
    if (!eventId) return toast.error('Select an event');
    try {
      await api.post('/surveys', { eventId, questions });
      toast.success('Survey created');
      setActiveSurvey(null);
      setResults(null);
      if (eventId) {
        api.get(`/surveys/${eventId}`).then((res) => setActiveSurvey(res.data.data)).catch(() => {});
        api.get(`/surveys/${eventId}/results`).then((res) => setResults(res.data.data)).catch(() => {});
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create survey');
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl font-bold mb-6">Surveys</h1>

      <div className="glass rounded-2xl p-6 mb-4">
        <label className="text-xs text-gray-500 block mb-1">Event</label>
        <select value={eventId} onChange={(e) => setEventId(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
          <option value="">Select event...</option>
          {events.map((e) => <option key={e._id} value={e._id}>{e.title}</option>)}
        </select>
      </div>

      {eventId && (
        <div className="flex gap-6 border-b border-border mb-6">
          {['create', 'results'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 text-sm transition border-b-2 ${
                tab === t ? 'text-rose border-rose font-medium' : 'text-gray-600 border-transparent hover:text-gray-400'
              }`}
            >
              {t === 'create' ? 'Create Survey' : 'Results'}
            </button>
          ))}
        </div>
      )}

      {tab === 'create' && eventId && (
        <div className="glass rounded-2xl p-6 space-y-4">
          {questions.map((q, i) => (
            <div key={i} className="bg-surface rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Question #{i + 1}</span>
                {questions.length > 1 && (
                  <button onClick={() => handleRemoveQuestion(i)} className="text-xs text-red-400">Remove</button>
                )}
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Question</label>
                <input value={q.question} onChange={(e) => handleQuestionChange(i, 'question', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500" placeholder="Your question..." />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Type</label>
                <select value={q.type} onChange={(e) => handleQuestionChange(i, 'type', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500">
                  <option value="rating">Rating (1-5)</option>
                  <option value="text">Text</option>
                  <option value="mcq">Multiple Choice</option>
                </select>
              </div>
              {q.type === 'mcq' && (
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 block">Options</label>
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex gap-2">
                      <input value={opt} onChange={(e) => handleOptionChange(i, oi, e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500" placeholder={`Option ${oi + 1}`} />
                      {oi === q.options.length - 1 && (
                        <button onClick={() => handleAddOption(i)} className="text-xs text-indigo-400 hover:text-indigo-300 shrink-0">+</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <button onClick={handleAddQuestion} className="text-xs text-indigo-400 hover:text-indigo-300">+ Add Question</button>
          <div className="pt-2">
            <button onClick={handleCreate} className="gradient-btn px-6 py-2.5 rounded-xl text-sm font-medium">
              Create Survey
            </button>
          </div>
        </div>
      )}

      {tab === 'results' && results && (
        <div className="space-y-4">
          {results.questions?.length > 0 ? results.questions.map((q, i) => (
            <div key={i} className="glass rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3">{q.question}</h3>
              {q.type === 'rating' && q.average && (
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold gradient-text">{Number(q.average).toFixed(1)}</span>
                  <span className="text-sm text-gray-500">/ 5 average</span>
                </div>
              )}
              {q.type === 'mcq' && q.counts && (
                <div className="space-y-2">
                  {Object.entries(q.counts).map(([opt, count]) => (
                    <div key={opt} className="flex items-center gap-3">
                      <span className="text-sm text-gray-400 w-32 truncate">{opt}</span>
                      <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(count / Math.max(1, Object.values(q.counts).reduce((a, b) => a + b, 0))) * 100}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              )}
              {q.type === 'text' && q.responses?.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {q.responses.map((r, ri) => (
                    <p key={ri} className="text-sm text-gray-400 bg-white/5 rounded-lg px-3 py-2">"{r}"</p>
                  ))}
                </div>
              )}
              {(q.type === 'text' && (!q.responses || q.responses.length === 0)) && (
                <p className="text-sm text-gray-600">No text responses yet.</p>
              )}
            </div>
          )) : (
            <p className="text-gray-500 text-sm">No responses yet.</p>
          )}
        </div>
      )}

      {tab === 'results' && !results && eventId && (
        <p className="text-gray-500 text-sm">Select an event to view results.</p>
      )}
    </div>
  );
}
