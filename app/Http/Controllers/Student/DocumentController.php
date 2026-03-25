<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DocumentController extends Controller
{
    public function index()
{
    $documents = Document::where('user_id', auth()->id())->get();
    return Inertia::render('Student/Documentations', [
        'documents' => $documents, // this is a Collection, which serializes to an array
    ]);
}

    public function upload(Request $request)
    {
        $request->validate([
            'type' => 'required|in:cv,identity_card,drivers_license,results',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        $user = auth()->user();
        $type = $request->type;

        // Delete old file if exists
        $old = Document::where('user_id', $user->user_id)->where('type', $type)->first();
        if ($old) {
            Storage::disk('public')->delete($old->file_path);
            $old->delete();
        }

        // Store new file
        $path = $request->file('file')->store("documents/{$user->user_id}", 'public');

        Document::create([
            'user_id'       => $user->user_id,
            'type'          => $type,
            'file_path'     => $path,
            'original_name' => $request->file('file')->getClientOriginalName(),
        ]);

        return back()->with('success', 'Document uploaded successfully.');
    }

    public function destroy($id)
    {
        $doc = Document::where('user_id', auth()->id())->findOrFail($id);
        Storage::disk('public')->delete($doc->file_path);
        $doc->delete();

        return back()->with('success', 'Document deleted.');
    }
}
