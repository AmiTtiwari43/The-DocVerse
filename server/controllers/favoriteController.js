const Favorite = require('../models/Favorite');
const Doctor = require('../models/Doctor');

// Add to favorites
exports.addFavorite = async (req, res) => {
  try {
    const { doctorId } = req.body;

    if (!doctorId) {
      return res.status(400).json({ success: false, message: 'Doctor ID is required' });
    }

    // Check if already favorited
    const existing = await Favorite.findOne({ userId: req.user.id, doctorId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already in favorites' });
    }

    const favorite = new Favorite({
      userId: req.user.id,
      doctorId,
    });

    await favorite.save();

    res.status(201).json({ success: true, data: favorite, message: 'Added to favorites' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove from favorites
exports.removeFavorite = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const favorite = await Favorite.findOneAndDelete({
      userId: req.user.id,
      doctorId,
    });

    if (!favorite) {
      return res.status(404).json({ success: false, message: 'Not in favorites' });
    }

    res.status(200).json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user favorites
exports.getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.user.id })
      .populate('doctorId')
      .sort({ createdAt: -1 });

    // Get doctors with ratings
    const favoritesWithRatings = await Promise.all(
      favorites.map(async (fav) => {
        const Review = require('../models/Review');
        const reviews = await Review.find({ doctorId: fav.doctorId._id });
        const avgRating = reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0;
        return {
          ...fav.toObject(),
          doctor: { ...fav.doctorId.toObject(), avgRating, reviewCount: reviews.length },
        };
      })
    );

    res.status(200).json({ success: true, data: favoritesWithRatings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check if doctor is favorited
exports.checkFavorite = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const favorite = await Favorite.findOne({
      userId: req.user.id,
      doctorId,
    });

    res.status(200).json({ success: true, data: { isFavorite: !!favorite } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

