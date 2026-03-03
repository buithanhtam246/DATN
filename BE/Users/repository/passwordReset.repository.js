const PasswordReset = require('../model/passwordReset.model');

class PasswordResetRepository {
  create(data) {
    return PasswordReset.create(data);
  }

  findValidByCode(userId, code) {
    const now = new Date();
    return PasswordReset.findOne({
      where: {
        user_id: userId,
        code,
        used: false,
        expires_at: { [require('sequelize').Op.gt]: now }
      }
    });
  }

  markUsed(id) {
    return PasswordReset.update({ used: true }, { where: { id } });
  }

  deleteExpired() {
    const now = new Date();
    return PasswordReset.destroy({ where: { expires_at: { [require('sequelize').Op.lt]: now } } });
  }
}

module.exports = new PasswordResetRepository();
