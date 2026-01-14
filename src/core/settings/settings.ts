export const SETTINGS = {
  get PORT() {
    return process.env.PORT || 5001;
  },
  get MONGO_URL() {
    return process.env.MONGO_URL || 'mongodb://localhost:27017/mongo';
  },
  get DB_NAME() {
    return process.env.DB_NAME || 'mongo';
  },
};
