require('dotenv').config();
const pool = require('../config/db');

async function migrate() {
    const client = await pool.connect();

    try {
        console.log('Starting migration for folders and thumbnails...\n');

        await client.query('BEGIN');

        // 1. Create folders table
        console.log('Creating folders table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS folders (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('✓ Folders table created');

        // 2. Create index for parent_id for faster queries
        console.log('Creating indexes...');
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id);
        `);
        console.log('✓ Index idx_folders_parent_id created');

        // 3. Add folder_id column to videos table
        console.log('Adding folder_id to videos table...');
        const folderIdExists = await client.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'videos' AND column_name = 'folder_id';
        `);

        if (folderIdExists.rows.length === 0) {
            await client.query(`
                ALTER TABLE videos
                ADD COLUMN folder_id UUID REFERENCES folders(id) ON DELETE SET NULL;
            `);
            console.log('✓ folder_id column added to videos');
        } else {
            console.log('✓ folder_id column already exists');
        }

        // 4. Add thumbnail column to videos table
        console.log('Adding thumbnail to videos table...');
        const thumbnailExists = await client.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'videos' AND column_name = 'thumbnail';
        `);

        if (thumbnailExists.rows.length === 0) {
            await client.query(`
                ALTER TABLE videos
                ADD COLUMN thumbnail VARCHAR(500);
            `);
            console.log('✓ thumbnail column added to videos');
        } else {
            console.log('✓ thumbnail column already exists');
        }

        // 5. Add thumbnail_grid column for 4-clip composite thumbnail
        console.log('Adding thumbnail_grid to videos table...');
        const thumbnailGridExists = await client.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'videos' AND column_name = 'thumbnail_grid';
        `);

        if (thumbnailGridExists.rows.length === 0) {
            await client.query(`
                ALTER TABLE videos
                ADD COLUMN thumbnail_grid VARCHAR(500);
            `);
            console.log('✓ thumbnail_grid column added to videos');
        } else {
            console.log('✓ thumbnail_grid column already exists');
        }

        // 6. Add duration column to videos table
        console.log('Adding duration to videos table...');
        const durationExists = await client.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'videos' AND column_name = 'duration';
        `);

        if (durationExists.rows.length === 0) {
            await client.query(`
                ALTER TABLE videos
                ADD COLUMN duration FLOAT;
            `);
            console.log('✓ duration column added to videos');
        } else {
            console.log('✓ duration column already exists');
        }

        // 7. Create index for folder_id on videos
        console.log('Creating index for videos folder_id...');
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_videos_folder_id ON videos(folder_id);
        `);
        console.log('✓ Index idx_videos_folder_id created');

        // 8. Create function for updated_at trigger
        console.log('Creating updated_at trigger function...');
        await client.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        `);
        console.log('✓ Trigger function created');

        // 9. Create trigger for folders table
        console.log('Creating trigger for folders...');
        await client.query(`
            DROP TRIGGER IF EXISTS update_folders_updated_at ON folders;
            CREATE TRIGGER update_folders_updated_at
                BEFORE UPDATE ON folders
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        `);
        console.log('✓ Trigger for folders created');

        await client.query('COMMIT');

        console.log('\n========================================');
        console.log('Migration completed successfully!');
        console.log('========================================\n');

        // Show current schema
        console.log('Current videos table schema:');
        const videosSchema = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'videos'
            ORDER BY ordinal_position;
        `);
        console.table(videosSchema.rows);

        console.log('\nCurrent folders table schema:');
        const foldersSchema = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'folders'
            ORDER BY ordinal_position;
        `);
        console.table(foldersSchema.rows);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

migrate()
    .then(() => {
        console.log('Migration script finished.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Migration script failed:', error);
        process.exit(1);
    });
