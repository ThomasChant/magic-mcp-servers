import { useSupabaseFavoritesService } from "../services/supabase-favorites";

/**
 * @function testSupabaseFavorites
 * @description Test function to verify Supabase favorites functionality
 */
export async function testSupabaseFavorites(): Promise<{
    success: boolean;
    results: string[];
    errors: string[];
}> {
    const results: string[] = [];
    const errors: string[] = [];
    let success = true;

    try {
        const service = useSupabaseFavoritesService();
        
        if (!service) {
            errors.push('Favorites service not available - user not authenticated');
            return { success: false, results, errors };
        }

        results.push('✓ Favorites service created successfully');

        // Test 1: Get initial favorites
        const initialFavorites = await service.getFavorites();
        results.push(`✓ Initial favorites: ${initialFavorites.length} items`);

        // Test 2: Add a test favorite
        const testServerId = 'test-server-id-' + Date.now();
        await service.addToFavorites(testServerId);
        results.push(`✓ Added test server ${testServerId} to favorites`);

        // Test 3: Verify it was added
        const favoritesAfterAdd = await service.getFavorites();
        if (favoritesAfterAdd.includes(testServerId)) {
            results.push('✓ Test server found in favorites after adding');
        } else {
            errors.push('✗ Test server not found in favorites after adding');
            success = false;
        }

        // Test 4: Remove the test favorite
        await service.removeFromFavorites(testServerId);
        results.push(`✓ Removed test server ${testServerId} from favorites`);

        // Test 5: Verify it was removed
        const favoritesAfterRemove = await service.getFavorites();
        if (!favoritesAfterRemove.includes(testServerId)) {
            results.push('✓ Test server not found in favorites after removal');
        } else {
            errors.push('✗ Test server still found in favorites after removal');
            success = false;
        }

        // Test 6: Test sync functionality
        const localTestFavorites = ['local-test-1', 'local-test-2'];
        const syncedFavorites = await service.syncWithLocal(localTestFavorites);
        results.push(`✓ Sync test completed: ${syncedFavorites.length} favorites after sync`);

        // Clean up test data
        for (const serverId of localTestFavorites) {
            try {
                await service.removeFromFavorites(serverId);
            } catch (e) {
                // Ignore cleanup errors
            }
        }
        results.push('✓ Test cleanup completed');

    } catch (error) {
        errors.push(`✗ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        success = false;
    }

    return { success, results, errors };
}

/**
 * @function logTestResults
 * @description Log test results to console
 */
export function logTestResults(testResults: {
    success: boolean;
    results: string[];
    errors: string[];
}) {
    console.group('🧪 Supabase Favorites Test Results');
    
    if (testResults.success) {
        console.log('🎉 All tests passed!');
    } else {
        console.error('❌ Some tests failed!');
    }

    console.group('✅ Successful Operations:');
    testResults.results.forEach(result => console.log(result));
    console.groupEnd();

    if (testResults.errors.length > 0) {
        console.group('❌ Errors:');
        testResults.errors.forEach(error => console.error(error));
        console.groupEnd();
    }

    console.groupEnd();
}