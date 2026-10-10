const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true },
});

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: null },
});

const examSchema = new mongoose.Schema({
  name: { type: String, required: true },
  conductingAuthority: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  qualification: { type: String, required: true },
  ageLimit: { type: Number, default: 30 },
  fees: { type: Number, default: 0.00 },
  importantDates: { type: String, required: true },
  eligibility: { type: String, required: true },
  examPattern: { type: String, required: true },
  syllabus: { type: String, required: true },
  vacancyCount: { type: Number, default: 0 },
  admitCardLink: { type: String, default: null },
  resultLink: { type: String, default: null },
  officialWebsite: { type: String, required: true },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const jobSchema = new mongoose.Schema({
  department: { type: String, required: true },
  postName: { type: String, required: true },
  vacancies: { type: Number, default: 1 },
  salaryRange: { type: String, required: true },
  qualification: { type: String, required: true },
  lastDate: { type: Date, required: true },
  state: { type: mongoose.Schema.Types.ObjectId, ref: 'State', default: null },
  officialNotification: { type: String, required: true },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const State = mongoose.model('State', stateSchema);
const Category = mongoose.model('Category', categorySchema);
const Exam = mongoose.model('Exam', examSchema);
const Job = mongoose.model('Job', jobSchema);

module.exports = { State, Category, Exam, Job };
