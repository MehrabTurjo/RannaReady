import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';

export const signUp = async (req, res) => {
    try {
        const {fullname, email, password, mobile, role} = req.body;
        const user= await User.findOne({email});
        if(user){
            return res.status(400).json({message: 'User already exists'});
        }
        if(password.length < 6){
            return res.status(400).json({message: 'Password must be at least 6 characters'});
        }
        if(mobile.length < 10){
            return res.status(400).json({message: 'Mobile number must be at least 10 characters'});
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        user = User.create({
            fullname,
            email,
            mobile,
            role,
            password: hashedPassword,
        });

        const token = await genToken(user._id);
        res.cookie('token', token, {
            secure: false,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true,
        })

        return res.status(201).json({message: 'User created successfully', user});



    } 
    catch (error) {
        return res.status(500).json({message: `Sign up Error : ${error.message}`});
    }

};

export const signIn = async (req, res) => {
    try {
        const {email, password} = req.body;
        const user= await User.findOne({email});
        if(!user){
            return res.status(400).json({message: 'User does not exist'});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({message: 'Invalid credentials'});
        }


        const token = await genToken(user._id);
        res.cookie('token', token, {
            secure: false,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true,
        })

        return res.status(200).json({message: 'User created successfully', user});



    } 
    catch (error) {
        return res.status(500).json(`sign in Error : ${error.message}` );
    }

};

export const signOut = async (req, res) => { 
    try {
        res.clearCookie('token');
        return res.status(200).json({message: 'Sign out successful'});
    }
    catch (error) {
        return res.status(500).json({message: `Sign out Error : ${error.message}`});
    }
};