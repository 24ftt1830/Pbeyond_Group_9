<?php

namespace App\Services;

use App\Models\Company;
use App\Models\CompanyBranch;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class CompanyBranchManager
{
    public static function rules(): array
    {
        return [
            'district' => ['nullable', Rule::in(CompanyBranch::DISTRICTS)],
            'branches' => ['sometimes', 'array', 'min:1'],
            'branches.*.id' => ['nullable', 'integer', 'distinct'],
            'branches.*.name' => ['required', 'string', 'max:150'],
            'branches.*.address' => ['required', 'string', 'max:2000'],
            'branches.*.district' => ['required', Rule::in(CompanyBranch::DISTRICTS)],
        ];
    }

    /** Caller wraps profile and branch changes in the same transaction. */
    public function sync(Company $company, array $branches): void
    {
        $retained = [];
        foreach ($branches as $index => $data) {
            $branch = !empty($data['id']) ? $company->branches()->find($data['id']) : null;
            if (!empty($data['id']) && !$branch) {
                throw ValidationException::withMessages(["branches.$index.name" => 'This branch does not belong to your company.']);
            }
            $values = collect($data)->only(['name', 'address', 'district'])->all();
            $branch ??= $company->branches()->make();
            $branch->fill($values)->save();
            $retained[] = $branch->id;
        }
        $removed = $company->branches()->whereNotIn('id', $retained)->get();
        foreach ($removed as $branch) {
            if ($branch->applications()->exists() || $branch->quotas()->exists()) {
                throw ValidationException::withMessages(['branches' => 'A branch used by a position or application cannot be removed. Remove it from unused positions first.']);
            }
            $branch->delete();
        }
    }
}
