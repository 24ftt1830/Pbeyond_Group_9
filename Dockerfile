FROM php:8.3-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev libxml2-dev zip unzip

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# --- CRITICAL CHANGE ---
# 1. Copy composer files first to leverage layer caching
COPY composer.json composer.lock ./

# 2. Install dependencies (this creates the vendor folder)
RUN composer install --no-dev --optimize-autoloader --no-scripts

# 3. Copy the rest of the application
COPY . .
# -----------------------

# Expose port 9000
EXPOSE 9000
CMD ["php-fpm"]
