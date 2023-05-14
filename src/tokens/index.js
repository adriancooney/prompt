"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatEstimatedTokenCount = exports.getEstimatedTokenCount = exports.getEncoder = void 0;
const encoder_data_compressed_1 = require("./encoder-data.compressed");
const encoder_bpe_compressed_1 = require("./encoder-bpe.compressed");
const encoder_1 = require("./encoder");
let _encoder;
function getEncoder() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!_encoder) {
            const encoderData = JSON.parse(yield decompressBlob(encoder_data_compressed_1.data));
            const encoderBpe = yield decompressBlob(encoder_bpe_compressed_1.data);
            _encoder = (0, encoder_1.createEncoder)(encoderData, encoderBpe);
        }
        return _encoder;
    });
}
exports.getEncoder = getEncoder;
function decompressBlob(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const base64Data = yield new Blob([data], { type: "text/plain" }).text();
        const gzipBlob = b64toBlob(base64Data, "application/gzip");
        // @ts-ignore
        const decompressionStream = new DecompressionStream("gzip");
        const decompressedStream = gzipBlob.stream().pipeThrough(decompressionStream);
        return yield new Response(decompressedStream).text();
    });
}
function b64toBlob(data, contentType, sliceSize = 512) {
    const byteCharacters = atob(data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
}
function getEstimatedTokenCount({ encode }, text) {
    return encode(text).length;
}
exports.getEstimatedTokenCount = getEstimatedTokenCount;
/**
 * Caveats: Always uses GPT-3 encoding regardless of model
 *
 * From OpenAI docs: (https://platform.openai.com/docs/guides/chat/introduction)
 *
 * # Counting tokens for chat API calls
 * Below is an example function for counting tokens for messages passed to gpt-3.5-turbo-0301.
 * The exact way that messages are converted into tokens may change from model to model. So when future model  * versions are released, the answers returned by this function may be only approximate. The ChatML  * documentation explains how messages are converted into tokens by the OpenAI API, and may be useful for  * writing your own function.
 *
 * ```py
 * def num_tokens_from_messages(messages, model="gpt-3.5-turbo-0301"):
 *   """Returns the number of tokens used by a list of messages."""
 *   try:
 *       encoding = tiktoken.encoding_for_model(model)
 *   except KeyError:
 *       encoding = tiktoken.get_encoding("cl100k_base")
 *   if model == "gpt-3.5-turbo-0301":  # note: future models may deviate from this
 *       num_tokens = 0
 *       for message in messages:
 *           num_tokens += 4  # every message follows <im_start>{role/name}\n{content}<im_end>\n
 *           for key, value in message.items():
 *               num_tokens += len(encoding.encode(value))
 *               if key == "name":  # if there's a name, the role is omitted
 *                   num_tokens += -1  # role is always required and always 1 token
 *       num_tokens += 2  # every reply is primed with <im_start>assistant
 *       return num_tokens
 *   else:
 *       raise NotImplementedError(f"""num_tokens_from_messages() is not presently implemented for model  * {model}.
 *   See https://github.com/openai/openai-python/blob/main/chatml.md for information on how messages are  * converted to tokens.""")
 * ```
 */
function getChatEstimatedTokenCount(encoder, messages) {
    return (messages.reduce((acc, message) => acc + 4 + getChatMessageEstimatedTokenCount(encoder, message), 0) + 2 // every reply is primed with <im_start>assistant
    );
}
exports.getChatEstimatedTokenCount = getChatEstimatedTokenCount;
function getChatMessageEstimatedTokenCount(encoder, message) {
    return (
    // If there's a name, count the token for the name otherwise the role is used (always 1 token)
    (message.name ? getEstimatedTokenCount(encoder, message.name) : 1) +
        getEstimatedTokenCount(encoder, message.content));
}
