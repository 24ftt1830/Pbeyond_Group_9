<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <link 
        rel="preload" 
        href="{{ Vite::asset('resources/images/bridge-cropped-top-two.png') }}" 
        as="image"
    >

        <title inertia>{{ config('app.name', 'Pbeyond') }}</title>

        <!-- Fonts -->
        <!--link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" /> -->
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Instrument+Sans:wght@400..700&display=swap" rel="stylesheet">

        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,401,500,501,700,701&display=swap" rel="stylesheet"> 
        <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville&family=Lora&display=swap" rel="stylesheet">
        
        <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

        <link rel="icon" type="image/svg+xml" href="/images/pb-pixel.svg">
        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
