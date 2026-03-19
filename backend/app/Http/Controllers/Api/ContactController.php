<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    // Public: submit a contact message
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'    => 'required|string|max:255',
            'email'   => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        $contact = Contact::create($validated);

        return response()->json([
            'message' => 'Your message has been received. We will get back to you shortly.',
            'data'    => $contact,
        ], 201);
    }

    // Admin: list all messages
    public function index(Request $request): JsonResponse
    {
        $query = Contact::query();

        if ($request->filled('is_read')) {
            $query->where('is_read', filter_var($request->is_read, FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%")
                  ->orWhere('subject', 'like', "%{$s}%");
            });
        }

        $messages = $query->orderBy('created_at', 'desc')
                          ->paginate($request->get('per_page', 10));

        return response()->json($messages);
    }

    // Admin: view single message (auto-marks as read)
    public function show(Contact $contact): JsonResponse
    {
        if (!$contact->is_read) {
            $contact->update(['is_read' => true]);
        }

        return response()->json($contact);
    }

    // Admin: toggle read/unread
    public function update(Request $request, Contact $contact): JsonResponse
    {
        $request->validate(['is_read' => 'required|boolean']);
        $contact->update(['is_read' => $request->is_read]);

        return response()->json([
            'message' => 'Status updated.',
            'data'    => $contact,
        ]);
    }

    // Admin: delete message
    public function destroy(Contact $contact): JsonResponse
    {
        $contact->delete();

        return response()->json(['message' => 'Message deleted.']);
    }

    // Admin: unread count badge
    public function unreadCount(): JsonResponse
    {
        return response()->json(['count' => Contact::where('is_read', false)->count()]);
    }
}
