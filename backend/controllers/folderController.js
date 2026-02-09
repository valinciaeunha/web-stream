const pool = require("../config/db");

// Helper: Resolve short ID (8 chars) to full UUID
const resolveFolderId = async (shortId) => {
  // If already full UUID format, return as-is
  if (shortId && shortId.length === 36 && shortId.includes("-")) {
    return shortId;
  }

  // Search by short ID prefix (first 8 characters of UUID)
  const result = await pool.query(
    "SELECT id FROM folders WHERE id::text LIKE $1 LIMIT 1",
    [`${shortId}%`],
  );

  if (result.rows.length > 0) {
    return result.rows[0].id;
  }

  return null;
};

// Create a new folder
exports.createFolder = async (req, res) => {
  try {
    const { name, parent_id } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Folder name is required" });
    }

    // Check if parent folder exists (if provided)
    if (parent_id) {
      const parentCheck = await pool.query(
        "SELECT id FROM folders WHERE id = $1",
        [parent_id],
      );
      if (parentCheck.rows.length === 0) {
        return res.status(404).json({ error: "Parent folder not found" });
      }
    }

    // Check for duplicate folder name in same parent
    const duplicateCheck = await pool.query(
      "SELECT id FROM folders WHERE name = $1 AND (parent_id = $2 OR (parent_id IS NULL AND $2 IS NULL))",
      [name.trim(), parent_id || null],
    );

    if (duplicateCheck.rows.length > 0) {
      return res
        .status(409)
        .json({ error: "Folder with this name already exists" });
    }

    const result = await pool.query(
      "INSERT INTO folders (name, parent_id) VALUES ($1, $2) RETURNING *",
      [name.trim(), parent_id || null],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create Folder Error:", error);
    res.status(500).json({ error: "Failed to create folder" });
  }
};

// Get all folders (optionally filtered by parent_id)
exports.getFolders = async (req, res) => {
  try {
    const { parent_id } = req.query;

    let query;
    let params;

    if (parent_id === "null" || parent_id === "" || parent_id === undefined) {
      // Get root folders (no parent)
      query = `
                SELECT f.*,
                    (SELECT COUNT(*) FROM folders WHERE parent_id = f.id) as subfolder_count,
                    (SELECT COUNT(*) FROM videos WHERE folder_id = f.id) as video_count
                FROM folders f
                WHERE f.parent_id IS NULL
                ORDER BY f.name ASC
            `;
      params = [];
    } else {
      // Get subfolders of a specific parent
      query = `
                SELECT f.*,
                    (SELECT COUNT(*) FROM folders WHERE parent_id = f.id) as subfolder_count,
                    (SELECT COUNT(*) FROM videos WHERE folder_id = f.id) as video_count
                FROM folders f
                WHERE f.parent_id = $1
                ORDER BY f.name ASC
            `;
      params = [parent_id];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Get Folders Error:", error);
    res.status(500).json({ error: "Failed to fetch folders" });
  }
};

// Get single folder by ID with breadcrumb path
exports.getFolder = async (req, res) => {
  try {
    const { id: rawId } = req.params;

    // Resolve short ID to full UUID
    const id = await resolveFolderId(rawId);
    if (!id) {
      return res.status(404).json({ error: "Folder not found" });
    }

    // Get folder details
    const folderResult = await pool.query(
      `SELECT f.*,
                (SELECT COUNT(*) FROM folders WHERE parent_id = f.id) as subfolder_count,
                (SELECT COUNT(*) FROM videos WHERE folder_id = f.id) as video_count
            FROM folders f
            WHERE f.id = $1`,
      [id],
    );

    if (folderResult.rows.length === 0) {
      return res.status(404).json({ error: "Folder not found" });
    }

    const folder = folderResult.rows[0];

    // Build breadcrumb path using recursive CTE
    const breadcrumbResult = await pool.query(
      `
            WITH RECURSIVE breadcrumb AS (
                SELECT id, name, parent_id, 1 as depth
                FROM folders
                WHERE id = $1

                UNION ALL

                SELECT f.id, f.name, f.parent_id, b.depth + 1
                FROM folders f
                INNER JOIN breadcrumb b ON f.id = b.parent_id
            )
            SELECT id, name FROM breadcrumb ORDER BY depth DESC
        `,
      [id],
    );

    folder.breadcrumb = breadcrumbResult.rows;

    res.json(folder);
  } catch (error) {
    console.error("Get Folder Error:", error);
    res.status(500).json({ error: "Failed to fetch folder" });
  }
};

// Get folder contents (subfolders + videos)
exports.getFolderContents = async (req, res) => {
  try {
    const { id: rawId } = req.params;

    // If id is 'root', get root contents
    let folderId = null;
    if (rawId !== "root") {
      // Resolve short ID to full UUID
      folderId = await resolveFolderId(rawId);
      if (!folderId) {
        return res.status(404).json({ error: "Folder not found" });
      }
    }

    // Verify folder exists (if not root)
    if (folderId) {
      const folderCheck = await pool.query(
        "SELECT id FROM folders WHERE id = $1",
        [folderId],
      );
      if (folderCheck.rows.length === 0) {
        return res.status(404).json({ error: "Folder not found" });
      }
    }

    // Get subfolders
    const foldersQuery = folderId
      ? "SELECT f.*, (SELECT COUNT(*) FROM folders WHERE parent_id = f.id) as subfolder_count, (SELECT COUNT(*) FROM videos WHERE folder_id = f.id) as video_count FROM folders f WHERE f.parent_id = $1 ORDER BY f.name ASC"
      : "SELECT f.*, (SELECT COUNT(*) FROM folders WHERE parent_id = f.id) as subfolder_count, (SELECT COUNT(*) FROM videos WHERE folder_id = f.id) as video_count FROM folders f WHERE f.parent_id IS NULL ORDER BY f.name ASC";

    const foldersResult = await pool.query(
      foldersQuery,
      folderId ? [folderId] : [],
    );

    // Get videos
    const videosQuery = folderId
      ? "SELECT id, original_name, status, created_at, thumbnail, thumbnail_grid, duration FROM videos WHERE folder_id = $1 ORDER BY created_at DESC"
      : "SELECT id, original_name, status, created_at, thumbnail, thumbnail_grid, duration FROM videos WHERE folder_id IS NULL ORDER BY created_at DESC";

    const videosResult = await pool.query(
      videosQuery,
      folderId ? [folderId] : [],
    );

    // Build breadcrumb if not root
    let breadcrumb = [];
    if (folderId) {
      const breadcrumbResult = await pool.query(
        `
                WITH RECURSIVE bc AS (
                    SELECT id, name, parent_id, 1 as depth
                    FROM folders
                    WHERE id = $1

                    UNION ALL

                    SELECT f.id, f.name, f.parent_id, bc.depth + 1
                    FROM folders f
                    INNER JOIN bc ON f.id = bc.parent_id
                )
                SELECT id, name FROM bc ORDER BY depth DESC
            `,
        [folderId],
      );
      breadcrumb = breadcrumbResult.rows;
    }

    res.json({
      folders: foldersResult.rows,
      videos: videosResult.rows,
      breadcrumb: breadcrumb,
    });
  } catch (error) {
    console.error("Get Folder Contents Error:", error);
    res.status(500).json({ error: "Failed to fetch folder contents" });
  }
};

// Update folder (rename)
exports.updateFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Folder name is required" });
    }

    // Get current folder to check parent_id
    const currentFolder = await pool.query(
      "SELECT parent_id FROM folders WHERE id = $1",
      [id],
    );
    if (currentFolder.rows.length === 0) {
      return res.status(404).json({ error: "Folder not found" });
    }

    const parentId = currentFolder.rows[0].parent_id;

    // Check for duplicate name in same parent
    const duplicateCheck = await pool.query(
      "SELECT id FROM folders WHERE name = $1 AND id != $2 AND (parent_id = $3 OR (parent_id IS NULL AND $3 IS NULL))",
      [name.trim(), id, parentId],
    );

    if (duplicateCheck.rows.length > 0) {
      return res
        .status(409)
        .json({ error: "Folder with this name already exists" });
    }

    const result = await pool.query(
      "UPDATE folders SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [name.trim(), id],
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update Folder Error:", error);
    res.status(500).json({ error: "Failed to update folder" });
  }
};

// Delete folder (and all contents recursively)
exports.deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if folder exists
    const folderCheck = await pool.query(
      "SELECT id FROM folders WHERE id = $1",
      [id],
    );
    if (folderCheck.rows.length === 0) {
      return res.status(404).json({ error: "Folder not found" });
    }

    // Get all video IDs in this folder and subfolders (for cleanup purposes)
    const videosResult = await pool.query(
      `
            WITH RECURSIVE subfolder AS (
                SELECT id FROM folders WHERE id = $1
                UNION ALL
                SELECT f.id FROM folders f
                INNER JOIN subfolder s ON f.parent_id = s.id
            )
            SELECT v.id FROM videos v WHERE v.folder_id IN (SELECT id FROM subfolder)
        `,
      [id],
    );

    const videoIds = videosResult.rows.map((r) => r.id);

    // Delete folder (cascade will handle subfolders, videos folder_id will be set to null)
    await pool.query("DELETE FROM folders WHERE id = $1", [id]);

    res.json({
      message: "Folder deleted successfully",
      affected_videos: videoIds.length,
      video_ids: videoIds,
    });
  } catch (error) {
    console.error("Delete Folder Error:", error);
    res.status(500).json({ error: "Failed to delete folder" });
  }
};

// Move video to folder
exports.moveVideoToFolder = async (req, res) => {
  try {
    const { video_id, folder_id } = req.body;

    if (!video_id) {
      return res.status(400).json({ error: "Video ID is required" });
    }

    // Verify video exists
    const videoCheck = await pool.query("SELECT id FROM videos WHERE id = $1", [
      video_id,
    ]);
    if (videoCheck.rows.length === 0) {
      return res.status(404).json({ error: "Video not found" });
    }

    // Verify folder exists (if provided)
    if (folder_id) {
      const folderCheck = await pool.query(
        "SELECT id FROM folders WHERE id = $1",
        [folder_id],
      );
      if (folderCheck.rows.length === 0) {
        return res.status(404).json({ error: "Folder not found" });
      }
    }

    await pool.query(
      "UPDATE videos SET folder_id = $1, updated_at = NOW() WHERE id = $2",
      [folder_id || null, video_id],
    );

    res.json({ message: "Video moved successfully" });
  } catch (error) {
    console.error("Move Video Error:", error);
    res.status(500).json({ error: "Failed to move video" });
  }
};

// Move folder to another folder
exports.moveFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { parent_id } = req.body;

    // Verify folder exists
    const folderCheck = await pool.query(
      "SELECT id, name FROM folders WHERE id = $1",
      [id],
    );
    if (folderCheck.rows.length === 0) {
      return res.status(404).json({ error: "Folder not found" });
    }

    // Prevent moving folder into itself or its descendants
    if (parent_id) {
      const descendantCheck = await pool.query(
        `
                WITH RECURSIVE descendants AS (
                    SELECT id FROM folders WHERE id = $1
                    UNION ALL
                    SELECT f.id FROM folders f
                    INNER JOIN descendants d ON f.parent_id = d.id
                )
                SELECT id FROM descendants WHERE id = $2
            `,
        [id, parent_id],
      );

      if (descendantCheck.rows.length > 0) {
        return res
          .status(400)
          .json({ error: "Cannot move folder into itself or its descendants" });
      }

      // Verify parent folder exists
      const parentCheck = await pool.query(
        "SELECT id FROM folders WHERE id = $1",
        [parent_id],
      );
      if (parentCheck.rows.length === 0) {
        return res.status(404).json({ error: "Parent folder not found" });
      }
    }

    // Check for duplicate name in new parent
    const folder = folderCheck.rows[0];
    const duplicateCheck = await pool.query(
      "SELECT id FROM folders WHERE name = $1 AND id != $2 AND (parent_id = $3 OR (parent_id IS NULL AND $3 IS NULL))",
      [folder.name, id, parent_id || null],
    );

    if (duplicateCheck.rows.length > 0) {
      return res
        .status(409)
        .json({ error: "Folder with this name already exists in destination" });
    }

    await pool.query(
      "UPDATE folders SET parent_id = $1, updated_at = NOW() WHERE id = $2",
      [parent_id || null, id],
    );

    res.json({ message: "Folder moved successfully" });
  } catch (error) {
    console.error("Move Folder Error:", error);
    res.status(500).json({ error: "Failed to move folder" });
  }
};
