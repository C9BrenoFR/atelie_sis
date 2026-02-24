<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('clients', [
            'clients' => Client::orderBy('name')->get(),
        ]);
    }

    public function show(Client $client): Response
    {
        return Inertia::render('client-detail', [
            'client' => $client,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'       => 'required|string|max:255',
            'phone'      => 'required|string|max:20',
            'gender'     => 'required|in:M,F,O',
            'birth_date' => 'required|date',
        ]);

        Client::create($data);

        return back();
    }

    public function update(Request $request, Client $client): RedirectResponse
    {
        $data = $request->validate([
            'name'       => 'sometimes|string|max:255',
            'phone'      => 'sometimes|string|max:20',
            'gender'     => 'sometimes|in:M,F,O',
            'birth_date' => 'sometimes|date',
        ]);

        $client->update($data);

        return back();
    }

    public function destroy(Client $client): RedirectResponse
    {
        $client->delete();

        return to_route('clients.index');
    }
}
