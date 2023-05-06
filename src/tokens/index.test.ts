import { getEstimatedTokenCount } from ".";

describe("tokens", () => {
  describe("getEstimatedTokenCount", () => {
    it("replicates platform.openai.com/tokenizer", () => {
      expect(
        getEstimatedTokenCount(
          `When you exercise your stock options, you must pay Income Tax, Universal Social Charge (USC), and Pay Related Social Insurance (PRSI) on any gain you make. The Income Tax and USC due on the exercise of a share option is known as Relevant Tax on Share Options (RTSO). The amount of gain is the difference between the market value of the shares on the date you exercise the option and the amount you paid for the shares (plus any amount paid for the grant of the option). You must pay RTSO within 30 days of exercising the option. (Note: The specific tax may vary based on the type of option scheme, but the general information provided is applicable to unapproved share option schemes.) Reference: [Citizens Information](https://www.citizensinformation.ie/en/money_and_tax/tax/income_tax/additional_incomes/employment_related_shares/unapproved_share_option_schemes.html)`
        )
      ).toEqual(203);
    });
  });
});
