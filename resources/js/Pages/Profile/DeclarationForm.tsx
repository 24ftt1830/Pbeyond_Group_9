import AccountSectionLayout from './Partials/AccountSectionLayout';

export default function DeclarationForm() {
    return (
        <AccountSectionLayout title="Declaration Form">
            <div className="mx-auto max-w-4xl rounded-xl border border-black/10 bg-white p-6 shadow">
                <h2 className="mb-4 text-lg font-semibold text-black">Terms and Conditions</h2>

                <div className="space-y-4 text-sm leading-relaxed text-black/80">
                    <p>
                        I, the undersigned, hereby declare that all information and supporting documents provided in this
                        application are true and accurate to the best of my knowledge. I understand that any false or
                        misleading information may result in the immediate rejection of my application or the termination
                        of my internship placement by the Industrial Linkages Division (ILD).
                    </p>
                    <p>
                        I further agree to abide by the rules and regulations set forth by both Politeknik Brunei and
                        the company during my industrial training. I consent to the sharing of my personal data with
                        potential companies for placement purposes and acknowledge that I have not accepted any other
                        internship offers prior to this submission.
                    </p>
                </div>

                <div className="mt-6 flex items-start gap-3">
                    <input id="declaration-agree" type="checkbox" className="mt-1 h-4 w-4 rounded border-black/30" />
                    <label htmlFor="declaration-agree" className="text-sm text-black">
                        I have read and agreed to the terms and conditions
                    </label>
                </div>

                <div className="mt-6">
                    <button
                        type="button"
                        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </AccountSectionLayout>
    );
}
