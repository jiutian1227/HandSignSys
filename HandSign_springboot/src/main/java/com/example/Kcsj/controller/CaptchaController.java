package com.example.Kcsj.controller;

import com.example.Kcsj.common.Result;
import org.springframework.web.bind.annotation.*;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.HashMap;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/captcha")
public class CaptchaController {

    private static final int WIDTH = 150;
    private static final int HEIGHT = 50;
    private static final int LINE_COUNT = 8;
    private static final Random random = new Random();
    private static final ConcurrentHashMap<String, Integer> CAPTCHA_MAP = new ConcurrentHashMap<>();
    private static final long CAPTCHA_EXPIRE = 5 * 60 * 1000L;

    @GetMapping("/get")
    public Result<HashMap<String, String>> getCaptcha() {
        int num1 = random.nextInt(50) + 1;
        int num2 = random.nextInt(50) + 1;
        int operator = random.nextInt(2);
        String opSymbol;
        int answer;

        if (operator == 0) {
            opSymbol = "+";
            answer = num1 + num2;
        } else {
            if (num1 < num2) {
                int temp = num1;
                num1 = num2;
                num2 = temp;
            }
            opSymbol = "-";
            answer = num1 - num2;
        }

        String captchaToken = UUID.randomUUID().toString().replace("-", "");
        CAPTCHA_MAP.put(captchaToken, answer);

        new Thread(() -> {
            try {
                TimeUnit.MILLISECONDS.sleep(CAPTCHA_EXPIRE);
                CAPTCHA_MAP.remove(captchaToken);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();

        BufferedImage image = new BufferedImage(WIDTH, HEIGHT, BufferedImage.TYPE_INT_RGB);
        Graphics g = image.getGraphics();

        g.setColor(getRandomColor(230, 250));
        g.fillRect(0, 0, WIDTH, HEIGHT);

        g.setColor(Color.BLACK);
        g.drawRect(0, 0, WIDTH - 1, HEIGHT - 1);

        for (int i = 0; i < LINE_COUNT; i++) {
            g.setColor(getRandomColor(150, 200));
            int x1 = random.nextInt(WIDTH);
            int y1 = random.nextInt(HEIGHT);
            int x2 = random.nextInt(WIDTH);
            int y2 = random.nextInt(HEIGHT);
            g.drawLine(x1, y1, x2, y2);
        }

        String expression = num1 + " " + opSymbol + " " + num2 + " = ?";
        g.setColor(getRandomColor(30, 100));
        g.setFont(new Font("微软雅黑", Font.BOLD, 24));
        FontMetrics metrics = g.getFontMetrics();
        int x = (WIDTH - metrics.stringWidth(expression)) / 2;
        int y = (HEIGHT - metrics.getHeight()) / 2 + metrics.getAscent();
        g.drawString(expression, x, y);
        g.dispose();

        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        try {
            ImageIO.write(image, "JPEG", bos);
        } catch (Exception e) {
            return Result.error("500", "图片生成失败");
        }
        String imageBase64 = "data:image/jpeg;base64," + Base64.getEncoder().encodeToString(bos.toByteArray());

        HashMap<String, String> result = new HashMap<>();
        result.put("captchaToken", captchaToken);
        result.put("captchaImage", imageBase64);
        return Result.success(result);
    }

    @PostMapping("/check")
    public Result<Boolean> checkCaptcha(@RequestBody HashMap<String, String> params) {
        String captchaToken = params.get("captchaToken");
        String userAnswer = params.get("userAnswer");

        if (captchaToken == null || !CAPTCHA_MAP.containsKey(captchaToken)) {
            return Result.error("1", "验证码已过期，请重新获取");
        }

        int correctAnswer = CAPTCHA_MAP.get(captchaToken);
        try {
            int input = Integer.parseInt(userAnswer);
            if (input == correctAnswer) {
                CAPTCHA_MAP.remove(captchaToken);
                return Result.success(true);
            } else {
                return Result.error("2", "验证码答案错误");
            }
        } catch (NumberFormatException e) {
            return Result.error("3", "请输入有效的数字答案");
        }
    }

    private Color getRandomColor(int min, int max) {
        if (min > 255) min = 255;
        if (max > 255) max = 255;
        int r = min + random.nextInt(max - min);
        int g = min + random.nextInt(max - min);
        int b = min + random.nextInt(max - min);
        return new Color(r, g, b);
    }
}