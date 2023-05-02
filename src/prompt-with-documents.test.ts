import fs from "fs";
import { promptWithDocuments } from "./prompt-with-documents";
import { fetchChatCompletion } from "./openai";

jest.mock("./openai");

const fetchChatCompletionMock = jest.mocked(fetchChatCompletion);
const DOCUMENTS = JSON.parse(
  fs.readFileSync(__dirname + "/__fixtures__/documents.json", "utf-8")
);

describe("prompt-with-documents", () => {
  afterEach(() => {
    fetchChatCompletionMock.mockReset();
  });

  describe("promptWithDocuments", () => {
    it("works", async () => {
      fetchChatCompletionMock.mockResolvedValueOnce(
        "When you exercise your stock options, you must pay Income Tax, Universal Social Charge (USC), and Pay Related Social Insurance (PRSI) on any gain you make. The Income Tax and USC due on the exercise of a share option is known as Relevant Tax on Share Options (RTSO). The amount of gain is the difference between the market value of the shares on the date you exercise the option and the amount you paid for the shares (plus any amount paid for the grant of the option). You must pay RTSO within 30 days of exercising the option. (Note: The specific tax may vary based on the type of option scheme, but the general information provided is applicable to unapproved share option schemes.) Reference: [Citizens Information](https://www.citizensinformation.ie/en/money_and_tax/tax/income_tax/additional_incomes/employment_related_shares/unapproved_share_option_schemes.html)"
      );

      expect(
        await promptWithDocuments(
          DOCUMENTS,
          "What tax must I pay when I exercise my stock options?"
        )
      ).toMatchInlineSnapshot(`
        {
          "output": "When you exercise your stock options, you must pay Income Tax, Universal Social Charge (USC), and Pay Related Social Insurance (PRSI) on any gain you make. The Income Tax and USC due on the exercise of a share option is known as Relevant Tax on Share Options (RTSO). The amount of gain is the difference between the market value of the shares on the date you exercise the option and the amount you paid for the shares (plus any amount paid for the grant of the option). You must pay RTSO within 30 days of exercising the option. (Note: The specific tax may vary based on the type of option scheme, but the general information provided is applicable to unapproved share option schemes.) Reference: [Citizens Information](https://www.citizensinformation.ie/en/money_and_tax/tax/income_tax/additional_incomes/employment_related_shares/unapproved_share_option_schemes.html)",
          "prompts": [
            {
              "content": "
        Given the following extracted parts of a long document and a question, create a final answer.
        If you don't know the answer, just say that you don't know. Don't try to make up an answer.
        Please include references if any.


          Breadcrumbs: Additional incomes > Employment related shares > Unapproved share option schemes > Taxation of a long option
        Title: Taxation on exercise date

        When you exercise an option, you must pay Income Tax, USC and PRSI on any gain you make.

        The Income Tax and USC due on the exercise of a share option is known as Relevant Tax on Share Options (RTSO). The amount of the gain is the difference between:

        *   the market value of the shares on the date you exercise the option
        *   and
        *   the amount you paid for the shares (plus any amount paid for the grant of the option).

        You must pay RTSO within 30 days of exercising the option and complete a [RTSO1 form](/en/additional-incomes/documents/form-rtso1.pdf "Form RTSO1").

        You must file an [Income Tax Return (Form 11)](/en/self-assessment-and-self-employment/filing-your-tax-return/index.aspx "Filing your tax return") for the year you exercise the option. Any tax you paid on the grant of the option will be offset against any tax due when you exercise the option. Your employer will also report details to Revenue of any options exercised by you.


        Breadcrumbs: Additional incomes > Employment related shares > Unapproved share option schemes > Taxation of a short option
        Title: Taxation on exercise date

        When you exercise an option, you must pay [Income Tax](/en/jobs-and-pensions/calculating-your-income-tax/index.aspx "Calculating your Income Tax"), [Universal Social Charge (USC)](/en/jobs-and-pensions/usc/index.aspx "What is USC?") and [Pay Related Social Insurance (PRSI)](https://www.gov.ie/en/publication/80e5ab-prsi-pay-related-social-insurance/ "Gov.ie - PRSI - Pay Related Social Insurance").

        The Income Tax and USC due on the exercise of a share option is known as Relevant Tax on Share Options (RTSO). The amount of the gain is the difference between:

        *   the market value of the shares on the date you exercise the option
        *   and
        *   the amount you paid for the shares (plus any amount paid for the grant of the option).

        You must pay RTSO within 30 days of exercising the option and complete a [RTSO1 form](/en/additional-incomes/documents/form-rtso1.pdf "Form RTSO1"). The 30 day period is inclusive of the exercise date.

        You must also file an [Income Tax Return (Form 11)](/en/self-assessment-and-self-employment/filing-your-tax-return/index.aspx "Filing your tax return") for the year you exercise the option. You should include details of the RTSO already paid in the relevant section of the form. Your employer will also report details to Revenue of any options exercised by you.


        Breadcrumbs: Additional incomes > Employment related shares > Unapproved share option schemes > How to calculate and pay Relevant Tax on Share Options
        Title: Step 3: When to pay RTSO

        You must pay RTSO within 30 days of exercising the options. The 30 day period includes the exercise date.

        Note

        From 1 January 2023 late payment of RTSO is subject to an Income Tax interest rate of 0.0219%. Prior to 1 January 2023 the interest rate was 0.0322%. Interest is charged for each day, or part thereof, from the date when the payment is due until the date the payment is made.

            ",
              "metadata": {
                "documents": [
                  "
          Breadcrumbs: Additional incomes > Employment related shares > Unapproved share option schemes > Taxation of a long option
        Title: Taxation on exercise date

        When you exercise an option, you must pay Income Tax, USC and PRSI on any gain you make.

        The Income Tax and USC due on the exercise of a share option is known as Relevant Tax on Share Options (RTSO). The amount of the gain is the difference between:

        *   the market value of the shares on the date you exercise the option
        *   and
        *   the amount you paid for the shares (plus any amount paid for the grant of the option).

        You must pay RTSO within 30 days of exercising the option and complete a [RTSO1 form](/en/additional-incomes/documents/form-rtso1.pdf "Form RTSO1").

        You must file an [Income Tax Return (Form 11)](/en/self-assessment-and-self-employment/filing-your-tax-return/index.aspx "Filing your tax return") for the year you exercise the option. Any tax you paid on the grant of the option will be offset against any tax due when you exercise the option. Your employer will also report details to Revenue of any options exercised by you.
        ",
                  "
        Breadcrumbs: Additional incomes > Employment related shares > Unapproved share option schemes > Taxation of a short option
        Title: Taxation on exercise date

        When you exercise an option, you must pay [Income Tax](/en/jobs-and-pensions/calculating-your-income-tax/index.aspx "Calculating your Income Tax"), [Universal Social Charge (USC)](/en/jobs-and-pensions/usc/index.aspx "What is USC?") and [Pay Related Social Insurance (PRSI)](https://www.gov.ie/en/publication/80e5ab-prsi-pay-related-social-insurance/ "Gov.ie - PRSI - Pay Related Social Insurance").

        The Income Tax and USC due on the exercise of a share option is known as Relevant Tax on Share Options (RTSO). The amount of the gain is the difference between:

        *   the market value of the shares on the date you exercise the option
        *   and
        *   the amount you paid for the shares (plus any amount paid for the grant of the option).

        You must pay RTSO within 30 days of exercising the option and complete a [RTSO1 form](/en/additional-incomes/documents/form-rtso1.pdf "Form RTSO1"). The 30 day period is inclusive of the exercise date.

        You must also file an [Income Tax Return (Form 11)](/en/self-assessment-and-self-employment/filing-your-tax-return/index.aspx "Filing your tax return") for the year you exercise the option. You should include details of the RTSO already paid in the relevant section of the form. Your employer will also report details to Revenue of any options exercised by you.
        ",
                  "
        Breadcrumbs: Additional incomes > Employment related shares > Unapproved share option schemes > How to calculate and pay Relevant Tax on Share Options
        Title: Step 3: When to pay RTSO

        You must pay RTSO within 30 days of exercising the options. The 30 day period includes the exercise date.

        Note

        From 1 January 2023 late payment of RTSO is subject to an Income Tax interest rate of 0.0219%. Prior to 1 January 2023 the interest rate was 0.0322%. Interest is charged for each day, or part thereof, from the date when the payment is due until the date the payment is made.
        ",
                ],
              },
              "role": "system",
            },
            {
              "content": "Question: What tax must I pay when I exercise my stock options?",
              "role": "user",
            },
            {
              "content": "When you exercise your stock options, you must pay Income Tax, Universal Social Charge (USC), and Pay Related Social Insurance (PRSI) on any gain you make. The Income Tax and USC due on the exercise of a share option is known as Relevant Tax on Share Options (RTSO). The amount of gain is the difference between the market value of the shares on the date you exercise the option and the amount you paid for the shares (plus any amount paid for the grant of the option). You must pay RTSO within 30 days of exercising the option. (Note: The specific tax may vary based on the type of option scheme, but the general information provided is applicable to unapproved share option schemes.) Reference: [Citizens Information](https://www.citizensinformation.ie/en/money_and_tax/tax/income_tax/additional_incomes/employment_related_shares/unapproved_share_option_schemes.html)",
              "role": "ai",
            },
          ],
          "timestamp": 1672531200000,
        }
      `);
    });
  });
});
