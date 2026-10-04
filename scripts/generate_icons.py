import zlib
import struct
import math
import os

def create_png(width, height, output_path):
    # Create raw RGBA image
    raw_data = bytearray()
    
    # Gradient colors
    # Top-left: #6366F1 (99, 102, 241)
    # Bottom-right: #8B5CF6 (139, 92, 246)
    
    for y in range(height):
        raw_data.append(0) # Filter byte: None
        for x in range(width):
            # Normalized coordinates [-1, 1]
            nx = (x / width) * 2 - 1
            ny = (y / height) * 2 - 1
            
            # Rounded squircle distance
            sq_dist = (nx**4 + ny**4)**0.25
            
            # Background gradient
            t = (x + y) / (width + height)
            r = int(99 + (139 - 99) * t)
            g = int(102 + (92 - 102) * t)
            b = int(241 + (246 - 241) * t)
            a = 255
            
            if sq_dist > 0.92:
                # Soft anti-aliased edge or transparent outside
                edge = (sq_dist - 0.92) / 0.08
                if edge >= 1.0:
                    a = 0
                else:
                    a = int(255 * (1.0 - edge))
            
            # Draw Sparkle / Checkmark Icon in Center
            # Checkmark coordinates:
            # Segment 1: from (0.35, 0.52) to (0.46, 0.65)
            # Segment 2: from (0.46, 0.65) to (0.70, 0.35)
            cx = x / width
            cy = y / height
            
            # Distance to checkmark lines
            def dist_to_segment(px, py, x1, y1, x2, y2):
                dx = x2 - x1
                dy = y2 - y1
                l2 = dx*dx + dy*dy
                if l2 == 0:
                    return math.hypot(px - x1, py - y1)
                t = max(0, min(1, ((px - x1)*dx + (py - y1)*dy) / l2))
                proj_x = x1 + t * dx
                proj_y = y1 + t * dy
                return math.hypot(px - proj_x, py - proj_y)
            
            d1 = dist_to_segment(cx, cy, 0.30, 0.50, 0.44, 0.66)
            d2 = dist_to_segment(cx, cy, 0.44, 0.66, 0.72, 0.34)
            d_check = min(d1, d2)
            
            check_thickness = 0.048
            if d_check < check_thickness and a > 0:
                # White checkmark
                edge_check = (check_thickness - d_check) / 0.015
                blend = min(1.0, max(0.0, edge_check))
                r = int(r * (1 - blend) + 255 * blend)
                g = int(g * (1 - blend) + 255 * blend)
                b = int(b * (1 - blend) + 255 * blend)

            # Subtask hierarchy branch dots (left side)
            # Dot 1: (0.22, 0.34)
            # Dot 2: (0.22, 0.50)
            # Dot 3: (0.22, 0.66)
            dots = [(0.20, 0.34), (0.20, 0.50), (0.20, 0.66)]
            for dot_x, dot_y in dots:
                d_dot = math.hypot(cx - dot_x, cy - dot_y)
                if d_dot < 0.022 and a > 0:
                    blend_dot = min(1.0, max(0.0, (0.022 - d_dot) / 0.008))
                    r = int(r * (1 - blend_dot) + 255 * blend_dot)
                    g = int(g * (1 - blend_dot) + 255 * blend_dot)
                    b = int(b * (1 - blend_dot) + 255 * blend_dot)

            raw_data.extend([r, g, b, a])
            
    # Compress IDAT
    compressed = zlib.compress(bytes(raw_data), 9)
    
    # Build PNG chunks
    def chunk(chunk_type, data):
        c = chunk_type.encode('ascii') + data
        crc = zlib.crc32(c) & 0xffffffff
        return struct.pack('>I', len(data)) + c + struct.pack('>I', crc)
    
    png_bytes = bytearray(b'\x89PNG\r\n\x1a\n')
    # IHDR
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    png_bytes.extend(chunk('IHDR', ihdr_data))
    # IDAT
    png_bytes.extend(chunk('IDAT', compressed))
    # IEND
    png_bytes.extend(chunk('IEND', b''))
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'wb') as f:
        f.write(png_bytes)
    print(f"Generated {output_path} ({width}x{height})")

if __name__ == '__main__':
    public_dir = '/Users/yashwantdasour/.gemini/antigravity-ide/scratch/hierarchical-todo/public'
    create_png(192, 192, os.path.join(public_dir, 'pwa-192x192.png'))
    create_png(512, 512, os.path.join(public_dir, 'pwa-512x512.png'))
    create_png(180, 180, os.path.join(public_dir, 'apple-touch-icon.png'))
    create_png(512, 512, os.path.join(public_dir, 'maskable-icon-512x512.png'))
