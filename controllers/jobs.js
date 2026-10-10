const { Job, Exam, State, Category } = require('../models/Portal');

module.exports.index = async (req, res) => {
  const { tab = 'jobs', state = 'All', category = 'All', search = '' } = req.query;

  const jobFilter = { isDeleted: false };
  if (state && state !== 'All') {
    jobFilter.$or = [{ state: state }, { state: null }];
  }
  if (search) {
    jobFilter.$or = [
      { postName: { $regex: search, $options: 'i' } },
      { department: { $regex: search, $options: 'i' } },
      { qualification: { $regex: search, $options: 'i' } }
    ];
  }

  const examFilter = { isDeleted: false };
  if (category && category !== 'All') {
    examFilter.category = category;
  }
  if (search) {
    examFilter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { conductingAuthority: { $regex: search, $options: 'i' } },
      { eligibility: { $regex: search, $options: 'i' } }
    ];
  }

  const [jobs, exams, states, categories] = await Promise.all([
    Job.find(jobFilter).populate('state', 'name code').sort({ postName: 1 }),
    Exam.find(examFilter).populate('category', 'name slug').sort({ name: 1 }),
    State.find().sort({ name: 1 }),
    Category.find().sort({ name: 1 })
  ]);

  res.render('jobs/index.ejs', {
    title: 'Sarkari Jobs & Competitive Exams Portal | GovScheme',
    jobs,
    exams,
    states,
    categories,
    currentTab: tab,
    currentState: state,
    currentCategory: category,
    searchQuery: search
  });
};
