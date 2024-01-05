const User = require("../../registeration/models/registering_model");
const Team = require("../../tasks/models/team_model");
const Invitation = require("../models/invitations_model");

// Create an invitation
exports.createInvite = async (req, res) => {
  try {
    const { recipientEmail, teamId } = req.body;
    console.log(recipientEmail, teamId)
    // Check if the user exists

    const user = await User.findOne({ email: recipientEmail });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const invite = new Invitation({
      senderId: req.user.userId
      ,
      recipientId: user._id,
      teamId,
    });

    await invite.save();

    res.json(invite);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Failed to create the invitation." });
  }
};

// Accept an invitation
exports.acceptInvite = async (req, res) => {
  try {
    const inviteId = req.params.inviteId;
    
    const invitation = await Invitation.findById(inviteId);

    if (!invitation) {
      return res.status(404).json({ error: "Invitation not found." });
    }

    const { senderId, recipientId, teamId } = invitation;

    // Add the user to the team
    const user = await User.findById(recipientId);
    const team = await Team.findById(teamId);

    if (!user || !team) {
      return res.status(404).json({ error: "User or team not found." });
    }

    // Check if the user is already a member of the team
    if (team.members.includes(recipientId)) {
      return res.status(400).json({ error: "User is already a member of the team." });
    }

    // Initialize the arrays if they are undefined
    user.teams = user.teams || [];
    team.members = team.members || [];

    // Update the user's teams and the team's members
    user.teams.push(teamId);
    team.members.push(recipientId);

    await user.save();
    await team.save();

    // Delete the invitation
    await Invitation.findByIdAndDelete(inviteId);

    res.json({ message: "Invitation accepted successfully." });
  } catch (error) {
    console.log(error)
  
    res.status(500).json({ error: "Failed to accept the invitation." });
  }
};

// Decline an invitation
exports.declineInvite = async (req, res) => {
  try {
    const inviteId = req.params.inviteId;

    await Invitation.findByIdAndDelete(inviteId);

    res.json({ message: "Invitation declined successfully." });
  } catch (error) {
   
    res.status(500).json({ error: "Failed to decline the invitation." });
  }
};

// Get all invitations for a user
exports.getUserInvitations = async (req, res) => {
  try {

    // Check if the user exists
    const user = await User.findOne({ _id: req.user.userId });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const invitations = await Invitation.find({ recipientId: user._id }).populate('senderId', 'name -_id').populate('teamId','name');
    res.json(invitations);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve user invitations." });
  }
};