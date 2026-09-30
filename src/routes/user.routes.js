import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';
import { registerUser , logoutUser , loginUser , refreshAccessToken} from '../controllers/user.controllers.js';

const router = Router();
router.route('/register').post(upload.fields([
    {
        name: 'avatar',
        maxCount: 1
    },{
        name:'coverImage',
        maxCount:1
    }
]), registerUser)

router.route('/')

router.route('/login').post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT , logoutUser)


router.route("/refresh_token").post(refreshAccessToken)

export default  router
