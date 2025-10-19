import { getUserFromEvent } from '~/server/utils/auth';
import { User } from '~/server/models/User';

export default defineEventHandler(async (event) => {
  const authUser = await getUserFromEvent(event);
  
  if (!authUser) {
    return {
      user: null
    };
  }

  // @ts-ignore - Mongoose type inference issue
  const user = await User.findById(authUser.userId).select('-password');
  
  return {
    user: user ? {
      id: user._id,
      email: user.email,
      name: user.name
    } : null
  };
});
