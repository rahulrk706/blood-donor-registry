<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Donor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DonorController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Donor::with('user:id,name,email');

        // Filter by blood type
        if ($request->filled('blood_type')) {
            $query->where('blood_type', $request->blood_type);
        }

        // Filter by availability
        if ($request->filled('is_available')) {
            $query->where('is_available', filter_var($request->is_available, FILTER_VALIDATE_BOOLEAN));
        }

        // Filter by city
        if ($request->filled('city')) {
            $query->where('city', 'like', '%' . $request->city . '%');
        }

        // Filter by gender
        if ($request->filled('gender')) {
            $query->where('gender', $request->gender);
        }

        // Search by name or email
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDir = $request->get('sort_dir', 'desc');
        $allowedSorts = ['name', 'blood_type', 'age', 'city', 'last_donation_date', 'created_at', 'is_available'];

        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        $donors = $query->paginate($request->get('per_page', 10));

        return response()->json($donors);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'               => 'required|string|max:255',
            'email'              => 'required|email|unique:donors,email',
            'phone'              => 'required|string|max:20',
            'blood_type'         => ['required', Rule::in(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])],
            'age'                => 'required|integer|min:18|max:65',
            'gender'             => ['required', Rule::in(['male', 'female', 'other'])],
            'city'               => 'required|string|max:100',
            'address'            => 'nullable|string|max:500',
            'weight'             => 'nullable|numeric|min:45|max:200',
            'last_donation_date' => 'nullable|date|before:today',
            'is_available'       => 'boolean',
            'notes'              => 'nullable|string|max:1000',
        ]);

        $donor = Donor::create(array_merge($validated, [
            'user_id' => $request->user()?->id,
        ]));

        return response()->json([
            'message' => 'Donor registered successfully.',
            'data'    => $donor,
        ], 201);
    }

    // Return the donor record belonging to the authenticated user
    public function myDonor(Request $request): JsonResponse
    {
        $donor = Donor::where('user_id', $request->user()->id)->first();

        if (!$donor) {
            return response()->json(['data' => null], 200);
        }

        return response()->json(['data' => $donor]);
    }

    public function adminStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'               => 'required|string|max:255',
            'email'              => 'required|email|unique:donors,email',
            'phone'              => 'required|string|max:20',
            'blood_type'         => ['required', Rule::in(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])],
            'age'                => 'required|integer|min:18|max:65',
            'gender'             => ['required', Rule::in(['male', 'female', 'other'])],
            'city'               => 'required|string|max:100',
            'address'            => 'nullable|string|max:500',
            'weight'             => 'nullable|numeric|min:45|max:200',
            'last_donation_date' => 'nullable|date|before:today',
            'is_available'       => 'boolean',
            'notes'              => 'nullable|string|max:1000',
            'user_id'            => 'nullable|exists:users,id|unique:donors,user_id',
        ]);

        $donor = Donor::create($validated);
        $donor->load('user:id,name,email');

        return response()->json([
            'message' => 'Donor registered successfully.',
            'data'    => $donor,
        ], 201);
    }

    public function adminUpdate(Request $request, Donor $donor): JsonResponse
    {
        $validated = $request->validate([
            'name'               => 'sometimes|string|max:255',
            'email'              => ['sometimes', 'email', Rule::unique('donors', 'email')->ignore($donor->id)],
            'phone'              => 'sometimes|string|max:20',
            'blood_type'         => ['sometimes', Rule::in(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])],
            'age'                => 'sometimes|integer|min:18|max:65',
            'gender'             => ['sometimes', Rule::in(['male', 'female', 'other'])],
            'city'               => 'sometimes|string|max:100',
            'address'            => 'nullable|string|max:500',
            'weight'             => 'nullable|numeric|min:45|max:200',
            'last_donation_date' => 'nullable|date|before:today',
            'is_available'       => 'boolean',
            'notes'              => 'nullable|string|max:1000',
            'user_id'            => ['nullable', 'exists:users,id', Rule::unique('donors', 'user_id')->ignore($donor->id)],
        ]);

        $donor->update($validated);
        $donor->load('user:id,name,email');

        return response()->json([
            'message' => 'Donor updated successfully.',
            'data'    => $donor,
        ]);
    }

    public function show(Donor $donor): JsonResponse
    {
        $donor->load('user:id,name,email');
        return response()->json($donor);
    }

    public function update(Request $request, Donor $donor): JsonResponse
    {
        $validated = $request->validate([
            'name'               => 'sometimes|string|max:255',
            'email'              => ['sometimes', 'email', Rule::unique('donors', 'email')->ignore($donor->id)],
            'phone'              => 'sometimes|string|max:20',
            'blood_type'         => ['sometimes', Rule::in(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])],
            'age'                => 'sometimes|integer|min:18|max:65',
            'gender'             => ['sometimes', Rule::in(['male', 'female', 'other'])],
            'city'               => 'sometimes|string|max:100',
            'address'            => 'nullable|string|max:500',
            'weight'             => 'nullable|numeric|min:45|max:200',
            'last_donation_date' => 'nullable|date|before:today',
            'is_available'       => 'boolean',
            'notes'              => 'nullable|string|max:1000',
        ]);

        $donor->update($validated);

        return response()->json([
            'message' => 'Donor updated successfully.',
            'data'    => $donor,
        ]);
    }

    public function destroy(Donor $donor): JsonResponse
    {
        $donor->delete();

        return response()->json(['message' => 'Donor removed successfully.'], 200);
    }
}
