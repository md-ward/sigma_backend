const { Schema, default: mongoose } = require("mongoose");

const inviteSchema = Schema({
    senderId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    recipientId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    teamId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Team"
    },
    status: {
        type: String,
        enum: ["Pending", "Accepted", "Declined"],
        default: "Pending"
    }
});

module.exports = mongoose.model("Invite", inviteSchema);