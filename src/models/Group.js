// /Users/isiahchillous/Documents/dev/backend/hbackend-api/src/models/Group.js

const { connectToDatabase } = require('../config/database');
const { ObjectId } = require('mongodb');

class Group {
  constructor(groupData) {
    this._id = groupData._id;
    this.name = groupData.name;
    this.description = groupData.description;
    this.createdBy = groupData.createdBy;
    this.type = groupData.type; // 'circle' or 'class'
    this.isPaid = groupData.isPaid || false;
    this.price = groupData.price || 0;
    this.schedule = groupData.schedule;
    this.startDate = groupData.startDate;
    this.endDate = groupData.endDate;
    this.maxMembers = groupData.maxMembers;
    this.members = groupData.members || [];
    this.moderators = groupData.moderators || [groupData.createdBy];
    this.speakers = groupData.speakers || [];
    this.chatEnabled = groupData.chatEnabled !== undefined ? groupData.chatEnabled : true;
    this.raiseHandEnabled = groupData.raiseHandEnabled !== undefined ? groupData.raiseHandEnabled : true;
    this.voipEnabled = groupData.voipEnabled || false;
    this.activeVoipMembers = groupData.activeVoipMembers || [];
    this.voipRoomSid = groupData.voipRoomSid;
    this.webrtcRoomId = groupData.webrtcRoomId;
    this.activeWebRTCMembers = groupData.activeWebRTCMembers || [];
    this.createdAt = groupData.createdAt || new Date();
    this.updatedAt = groupData.updatedAt || new Date();
  }

  async save() {
    const db = await connectToDatabase();
    this.updatedAt = new Date();
    if (this._id) {
      return await db.collection('groups').updateOne(
        { _id: new ObjectId(this._id) },
        { $set: this }
      );
    } else {
      const result = await db.collection('groups').insertOne(this);
      this._id = result.insertedId;
      return result;
    }
  }

  static async findById(id) {
    const db = await connectToDatabase();
    const group = await db.collection('groups').findOne({ _id: new ObjectId(id) });
    return group ? new Group(group) : null;
  }

  static async findAll(query = {}, page = 1, limit = 10) {
    const db = await connectToDatabase();
    const skip = (page - 1) * limit;
    const groups = await db.collection('groups')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    return groups.map(group => new Group(group));
  }

  static async countDocuments(query = {}) {
    const db = await connectToDatabase();
    return await db.collection('groups').countDocuments(query);
  }

  async addMember(userId) {
    if (!this.members.includes(userId)) {
      this.members.push(userId);
      await this.save();
    }
  }

  async removeMember(userId) {
    this.members = this.members.filter(memberId => memberId.toString() !== userId.toString());
    await this.save();
  }



  isLive() {
    if (this.type === 'circle') return true;
    if (this.type === 'class') {
      const now = new Date();
      return now >= this.startDate && now <= this.endDate;
    }
    return false;
  }

  async addModerator(userId) {
    if (!this.moderators.includes(userId)) {
      this.moderators.push(userId);
      await this.save();
    }
  }

  async removeModerator(userId) {
    this.moderators = this.moderators.filter(modId => modId.toString() !== userId.toString());
    await this.save();
  }

  async toggleChat(enabled) {
    this.chatEnabled = enabled;
    await this.save();
  }

  async toggleRaiseHand(enabled) {
    this.raiseHandEnabled = enabled;
    await this.save();
  }

  async addSpeaker(userId) {
    if (!this.speakers.includes(userId)) {
      this.speakers.push(userId);
      await this.save();
    }
  }

  async removeSpeaker(userId) {
    this.speakers = this.speakers.filter(speakerId => speakerId.toString() !== userId.toString());
    await this.save();
  }
  async createWebRTCRoom() {
    if (!this.webrtcRoomId) {
      this.webrtcRoomId = new ObjectId().toString();
      await this.save();
    }
    return this.webrtcRoomId;
  }

  async addActiveWebRTCMember(userId) {
    if (!this.activeWebRTCMembers.includes(userId)) {
      this.activeWebRTCMembers.push(userId);
      await this.save();
    }
  }

  async removeActiveWebRTCMember(userId) {
    this.activeWebRTCMembers = this.activeWebRTCMembers.filter(id => id.toString() !== userId.toString());
    await this.save();
  }
}

module.exports = Group;