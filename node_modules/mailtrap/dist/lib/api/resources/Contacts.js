"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../../../config"));
const { CLIENT_SETTINGS } = config_1.default;
const { GENERAL_ENDPOINT } = CLIENT_SETTINGS;
class ContactsApi {
    constructor(client, accountId) {
        this.client = client;
        this.contactsURL = `${GENERAL_ENDPOINT}/api/accounts/${accountId}/contacts`;
    }
    /**
     * Get a contact by ID or email.
     */
    async get(idOrEmail) {
        const url = `${this.contactsURL}/${idOrEmail}`;
        return this.client.get(url);
    }
    /**
     * Creates a new contact.
     */
    async create(contact) {
        return this.client.post(this.contactsURL, { contact });
    }
    /**
     * Updates an existing contact by ID or email.
     */
    async update(identifier, contact) {
        const url = `${this.contactsURL}/${identifier}`;
        return this.client.patch(url, {
            contact,
        });
    }
    /**
     * Deletes a contact by ID or email.
     */
    async delete(identifier) {
        const url = `${this.contactsURL}/${identifier}`;
        return this.client.delete(url);
    }
}
exports.default = ContactsApi;
