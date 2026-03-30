<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('services', [
            'services' => Service::orderBy('title')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'duration' => 'required|date_format:H:i',
            'value' => 'required|numeric|min:0',
            'photo' => 'nullable|image|max:2048',
        ]);

        $data['photo'] = $request->hasFile('photo')
            ? $request->file('photo')->store('services', 'public')
            : 'default.jpg';

        Service::create($data);

        return back();
    }

    public function update(Request $request, Service $service): RedirectResponse
    {
        $data = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|nullable|string|max:1000',
            'duration' => 'sometimes|date_format:H:i',
            'value' => 'sometimes|numeric|min:0',
            'photo' => 'sometimes|nullable|image|max:2048',
        ]);

        if ($request->hasFile('photo')) {
            if ($service->photo && !$this->isDefaultPhoto($service->photo)) {
                Storage::disk('public')->delete($service->photo);
            }

            $data['photo'] = $request->file('photo')->store('services', 'public');
        }

        $service->update($data);

        return back();
    }

    public function destroy(Service $service): RedirectResponse
    {
        if ($service->photo && !$this->isDefaultPhoto($service->photo)) {
            Storage::disk('public')->delete($service->photo);
        }

        $service->delete();

        return to_route('services.index');
    }

    private function isDefaultPhoto(string $photoPath): bool
    {
        return basename($photoPath) === 'default.jpg';
    }
}
