"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adaptReplyToRecipient = exports.adaptSingleRecipient = void 0;
/**
 * If type of `recipient` is string, then wraps it into email object.
 * Otherwise maps into { `name`, `email` } pair.
 */
function adaptSingleRecipient(recipient) {
    if (typeof recipient === "string") {
        return { email: recipient };
    }
    return { name: recipient.name, email: recipient.address };
}
exports.adaptSingleRecipient = adaptSingleRecipient;
/**
 * If there is no recipient, then returns empty array.
 * If it's not array, then adopts recipient and wraps into array.
 * Otherwise maps trough recipients and adopts each one for Mailtrap.
 */
function adaptRecipients(recipients) {
    if (!recipients) {
        return [];
    }
    if (!Array.isArray(recipients)) {
        return [adaptSingleRecipient(recipients)];
    }
    return recipients.map(adaptSingleRecipient);
}
exports.default = adaptRecipients;
/**
 * If there is no recipient or empty array is passed, then return undefined since it is an optional field.
 * If it's not array, then adapt recipient and returns it.
 * Otherwise, if type is array as nodemailer allows, we pick the first recipient
 * as Mailtrap doesn't support multiple reply-to recipients.
 */
function adaptReplyToRecipient(recipients) {
    if (!recipients || (Array.isArray(recipients) && recipients.length === 0)) {
        return undefined;
    }
    if (!Array.isArray(recipients)) {
        return adaptSingleRecipient(recipients);
    }
    return adaptSingleRecipient(recipients[0]);
}
exports.adaptReplyToRecipient = adaptReplyToRecipient;
