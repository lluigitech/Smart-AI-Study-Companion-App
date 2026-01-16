const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client("972820786656-hdl7scf0j1r83fv7gh4pg7o6q8lph5of.apps.googleusercontent.com");

// API Route para sa Google Login
const googleLogin = async (req, res) => {
    const { access_token } = req.body;

    try {
        // Kunin ang user info gamit ang access token mula sa frontend
        const googleResponse = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);
        const { email, given_name, family_name, picture } = googleResponse.data;

        // 1. I-check kung registered na ang email sa DB
        let user = await User.findOne({ where: { email } });

        if (!user) {
            // 2. Kung wala pa, i-create ang bagong user (Auto-registration)
            // Gamit ang proposal format niyo para sa username
            const autoUsername = (given_name + Math.floor(Math.random() * 1000)).toLowerCase().replace(/\s/g, '');
            
            user = await User.create({
                first_name: given_name,
                last_name: family_name,
                email: email,
                username: autoUsername,
                password: 'google-auth-user', // dummy password dahil via Google sila
                learning_style: 'Not Set' 
            });
        }

        // 3. Mag-generate ng session (JWT o user data)
        res.status(200).json({
            message: "Login successful",
            user: user
        });

    } catch (error) {
        res.status(400).json({ message: "Google verification failed" });
    }
};