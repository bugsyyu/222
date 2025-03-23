<?php
/**
 * 课程评分API
 * 
 * 接收用户对课程的评分并保存到数据库
 * 返回更新后的课程评分统计
 */

// 设置header
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// 如果是OPTIONS请求，直接返回200
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 检查请求方法
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => '不支持的请求方法，请使用POST']);
    exit;
}

// 包含数据库连接文件
require_once '../../config/database.php';

// 获取POST数据
$data = json_decode(file_get_contents('php://input'), true);

// 验证用户是否登录
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(['error' => '请先登录后再评分']);
    exit;
}

// 验证必要参数
if (!isset($data['course_id']) || !isset($data['rating'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => '缺少必要参数']);
    exit;
}

// 验证评分范围
$courseId = intval($data['course_id']);
$rating = intval($data['rating']);
$userId = intval($_SESSION['user_id']);

if ($rating < 1 || $rating > 5) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => '评分必须在1-5之间']);
    exit;
}

try {
    // 检查课程是否存在
    $checkCourseStmt = $pdo->prepare('SELECT id FROM courses WHERE id = ?');
    $checkCourseStmt->execute([$courseId]);
    
    if ($checkCourseStmt->rowCount() === 0) {
        http_response_code(404); // Not Found
        echo json_encode(['error' => '课程不存在']);
        exit;
    }
    
    // 检查用户是否已评分过此课程
    $checkRatingStmt = $pdo->prepare('SELECT id FROM course_ratings WHERE user_id = ? AND course_id = ?');
    $checkRatingStmt->execute([$userId, $courseId]);
    
    if ($checkRatingStmt->rowCount() > 0) {
        // 用户已评分过，更新评分
        $updateStmt = $pdo->prepare('UPDATE course_ratings SET rating = ?, updated_at = NOW() WHERE user_id = ? AND course_id = ?');
        $updateStmt->execute([$rating, $userId, $courseId]);
    } else {
        // 用户未评分过，新增评分
        $insertStmt = $pdo->prepare('INSERT INTO course_ratings (course_id, user_id, rating, created_at) VALUES (?, ?, ?, NOW())');
        $insertStmt->execute([$courseId, $userId, $rating]);
    }
    
    // 获取更新后的评分统计
    $statsStmt = $pdo->prepare('
        SELECT 
            COUNT(*) as rating_count, 
            AVG(rating) as average_rating 
        FROM course_ratings 
        WHERE course_id = ?
    ');
    $statsStmt->execute([$courseId]);
    $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);
    
    // 更新课程表中的评分数据
    $updateCourseStmt = $pdo->prepare('
        UPDATE courses 
        SET rating = ?, rating_count = ? 
        WHERE id = ?
    ');
    $updateCourseStmt->execute([
        $stats['average_rating'], 
        $stats['rating_count'], 
        $courseId
    ]);
    
    // 返回成功响应
    echo json_encode([
        'success' => true,
        'message' => '评分提交成功',
        'data' => [
            'rating' => round($stats['average_rating'], 1),
            'rating_count' => $stats['rating_count']
        ]
    ]);
    
} catch (PDOException $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(['error' => '服务器错误: ' . $e->getMessage()]);
}
?> 