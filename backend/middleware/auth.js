import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Not authorized — no token provided' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    // Resolve storeOwnerId: staff manages their store's admin catalog
    let storeOwnerId = user._id;
    if (user.role === 'staff') {
      const admin = await User.findOne({ storeName: user.storeName, role: 'admin' });
      if (admin) {
        storeOwnerId = admin._id;
      }
    }

    req.user = user;
    req.user.storeOwnerId = storeOwnerId;
    
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      error: 'Not authorized — invalid token' 
    });
  }
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role '${req.user?.role || 'none'}' is not authorized to access this route`
      });
    }
    next();
  };
};
