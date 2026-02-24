<?php

namespace App\Http\Middleware;

use App\Helpers\ClinicConfig;
use App\Models\Client;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'sidebarOpen'    => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'clinic'         => ClinicConfig::toArray(),
            'clientOptions'  => fn () => $request->user() ? Client::orderBy('name')->get(['id', 'name']) : [],
            'serviceOptions' => fn () => $request->user() ? Service::orderBy('title')->get(['id', 'title', 'duration', 'value']) : [],
            'userOptions'    => fn () => $request->user() ? User::orderBy('name')->get(['id', 'name']) : [],
            'paymentMethods' => ClinicConfig::paymentMethods(),
        ];
    }
}
