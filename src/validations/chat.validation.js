const Joi = require("joi");

exports.createChatSchema = Joi.object({
  participantIds: Joi.array()
    .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))
    .min(1)
    .required(),
  chatType: Joi.string().valid("direct", "group").required(),
  groupId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .when("chatType", { is: "group", then: Joi.required() }),
});

exports.sendMessageSchema = Joi.object({
  chatId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required(),
  content: Joi.string().trim().min(1).max(1000).required(),
});
