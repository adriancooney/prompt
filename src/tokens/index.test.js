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
const _1 = require(".");
let encoder;
describe("tokens", () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        encoder = yield (0, _1.getEncoder)();
    }));
    describe("getEstimatedTokenCount", () => {
        it("replicates platform.openai.com/tokenizer", () => {
            expect((0, _1.getEstimatedTokenCount)(encoder, `When you exercise your stock options, you must pay Income Tax, Universal Social Charge (USC), and Pay Related Social Insurance (PRSI) on any gain you make. The Income Tax and USC due on the exercise of a share option is known as Relevant Tax on Share Options (RTSO). The amount of gain is the difference between the market value of the shares on the date you exercise the option and the amount you paid for the shares (plus any amount paid for the grant of the option). You must pay RTSO within 30 days of exercising the option. (Note: The specific tax may vary based on the type of option scheme, but the general information provided is applicable to unapproved share option schemes.) Reference: [Citizens Information](https://www.citizensinformation.ie/en/money_and_tax/tax/income_tax/additional_incomes/employment_related_shares/unapproved_share_option_schemes.html)`)).toEqual(203);
        });
    });
});
