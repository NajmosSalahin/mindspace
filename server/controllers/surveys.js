import Survey from '../models/Survey.js';

export const createSurvey = async (req, res, next) => {
  try {
    const survey = await Survey.create({ ...req.body, eventId: req.body.eventId });
    res.status(201).json({ success: true, data: survey });
  } catch (error) {
    next(error);
  }
};

export const getSurvey = async (req, res, next) => {
  try {
    const survey = await Survey.findOne({ eventId: req.params.eventId, isActive: true });
    if (!survey) return res.status(404).json({ success: false, message: 'No active survey found' });
    res.json({ success: true, data: survey });
  } catch (error) {
    next(error);
  }
};

export const respondSurvey = async (req, res, next) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey || !survey.isActive) return res.status(404).json({ success: false, message: 'Survey not found' });
    const alreadyResponded = survey.responses.find((r) => r.userId.toString() === req.user._id.toString());
    if (alreadyResponded) return res.status(400).json({ success: false, message: 'Already responded' });
    survey.responses.push({ userId: req.user._id, answers: req.body.answers });
    await survey.save();
    res.json({ success: true, message: 'Survey response submitted' });
  } catch (error) {
    next(error);
  }
};

export const getSurveyResults = async (req, res, next) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) return res.status(404).json({ success: false, message: 'Survey not found' });
    const results = survey.questions.map((q, idx) => {
      const answers = survey.responses.map((r) => r.answers[idx]);
      if (q.type === 'rating') {
        const sum = answers.reduce((s, a) => s + (parseInt(a) || 0), 0);
        const avg = answers.length > 0 ? sum / answers.length : 0;
        return { question: q.question, type: q.type, average: avg, count: answers.length };
      }
      if (q.type === 'mcq') {
        const counts = {};
        answers.forEach((a) => { counts[a] = (counts[a] || 0) + 1; });
        return { question: q.question, type: q.type, counts };
      }
      return { question: q.question, type: q.type, responses: answers.filter(Boolean) };
    });
    res.json({ success: true, data: { totalResponses: survey.responses.length, results } });
  } catch (error) {
    next(error);
  }
};

export const deleteSurvey = async (req, res, next) => {
  try {
    const survey = await Survey.findByIdAndDelete(req.params.id);
    if (!survey) return res.status(404).json({ success: false, message: 'Survey not found' });
    res.json({ success: true, message: 'Survey deleted' });
  } catch (error) {
    next(error);
  }
};
