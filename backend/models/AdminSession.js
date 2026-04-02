import mongoose from 'mongoose';

const adminSessionSchema = new mongoose.Schema({
  email: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

const AdminSession = mongoose.model('AdminSession', adminSessionSchema);

export default AdminSession;
