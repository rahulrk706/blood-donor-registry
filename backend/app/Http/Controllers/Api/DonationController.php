<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use App\Models\Donor;
use Illuminate\Http\Request;

class DonationController extends Controller
{
    public function adminIndex(Donor $donor): \Illuminate\Http\JsonResponse
    {
        $donations = $donor->donations()->orderBy('donation_date', 'desc')->get();
        return response()->json(['data' => $donations, 'donor' => $donor]);
    }

    public function index(Request $request)
    {
        $donor = $request->user()->donor;
        if (!$donor) {
            return response()->json(['data' => []]);
        }

        $donations = $donor->donations()->orderBy('donation_date', 'desc')->get();
        return response()->json(['data' => $donations]);
    }

    public function store(Request $request)
    {
        $donor = $request->user()->donor;
        if (!$donor) {
            return response()->json(['message' => 'No donor profile found.'], 422);
        }

        $validated = $request->validate([
            'donation_date' => 'required|date|before_or_equal:today',
            'donation_type' => 'required|in:whole_blood,plasma,platelets,double_red_cells',
            'blood_bank'    => 'nullable|string|max:255',
            'city'          => 'nullable|string|max:255',
            'notes'         => 'nullable|string|max:500',
        ]);

        $donation = $donor->donations()->create($validated);

        // Keep last_donation_date in sync with the most recent donation
        $latestDate = $donor->donations()->max('donation_date');
        $donor->update(['last_donation_date' => $latestDate]);

        return response()->json(['data' => $donation], 201);
    }

    public function destroy(Request $request, Donation $donation)
    {
        $donor = $request->user()->donor;
        if (!$donor || $donation->donor_id !== $donor->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $donation->delete();

        // Recalculate last_donation_date after deletion
        $latestDate = $donor->donations()->max('donation_date');
        $donor->update(['last_donation_date' => $latestDate]);

        return response()->json(['message' => 'Deleted.']);
    }
}
