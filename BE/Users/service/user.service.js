const userRepo = require('../repository/user.repository');

class UserService {
	async getUserProfile(userId) {
		const user = await userRepo.findById(userId);
		if (!user) throw new Error('Không tìm thấy user');
		return {
			id: user.id,
			name: user.name,
			email: user.email,
			phone: user.phone
			// ... các trường khác nếu cần
		};
	}
}

module.exports = new UserService();
 
