-- 为server_readmes表添加README结构化提取字段
-- 创建时间: 2025年1月4日

-- 添加结构化提取字段
ALTER TABLE server_readmes ADD COLUMN IF NOT EXISTS extracted_installation JSONB;
ALTER TABLE server_readmes ADD COLUMN IF NOT EXISTS extracted_api_reference JSONB;
ALTER TABLE server_readmes ADD COLUMN IF NOT EXISTS extraction_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE server_readmes ADD COLUMN IF NOT EXISTS extraction_error TEXT;
ALTER TABLE server_readmes ADD COLUMN IF NOT EXISTS extracted_at TIMESTAMP WITH TIME ZONE;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_server_readmes_extraction_status ON server_readmes(extraction_status);
CREATE INDEX IF NOT EXISTS idx_server_readmes_extracted_at ON server_readmes(extracted_at);

-- 更新已有记录的extraction_status
UPDATE server_readmes SET extraction_status = 'pending' WHERE extraction_status IS NULL;

-- 添加约束检查
ALTER TABLE server_readmes ADD CONSTRAINT check_extraction_status 
CHECK (extraction_status IN ('pending', 'processing', 'completed', 'failed'));