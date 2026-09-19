package com.example.Kcsj.controller;
import com.alibaba.fastjson.JSONObject;
import com.example.Kcsj.common.Result;
import com.example.Kcsj.entity.ImgRecords;
import com.example.Kcsj.mapper.ImgRecordsMapper;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import javax.annotation.Resource;
import java.util.Date;

@RestController
@RequestMapping("/flask")
public class PredictionController {
    @Resource
    ImgRecordsMapper imgRecordsMapper;

    private final RestTemplate restTemplate = new RestTemplate();

    // 定义接收的参数类
    public static class PredictRequest {
        private String startTime;
        private String weight;
        private String username;
        private String inputImg;
        private String conf;
        private String ai;
        private String suggestion;

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getStartTime() {
            return startTime;
        }

        public void setStartTime(String startTime) {
            this.startTime = startTime;
        }

        public String getWeight() {
            return weight;
        }

        public void setWeight(String weight) {
            this.weight = weight;
        }

        public String getInputImg() {
            return inputImg;
        }

        public void setInputImg(String inputImg) {
            this.inputImg = inputImg;
        }

        public String getConf() {
            return conf;
        }

        public void setConf(String conf) {
            this.conf = conf;
        }

        public String getAi() {
            return ai;
        }

        public void setAi(String ai) {
            this.ai = ai;
        }

        public String getSuggestion() {
            return suggestion;
        }

        public void setSuggestion(String suggestion) {
            this.suggestion = suggestion;
        }
    }

    @PostMapping("/predict")
    public Result<?> predict(@RequestBody PredictRequest request) {
        if (request == null || request.getInputImg() == null || request.getInputImg().isEmpty()) {
            return Result.error("-1", "未提供图片链接");
        } else if (request.getWeight() == null || request.getWeight().isEmpty()) {
            return Result.error("-1", "未提供权重");
        }

        try {
            // 创建请求体
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<PredictRequest> requestEntity = new HttpEntity<>(request, headers);

            // 调用 Flask API
//            String response = restTemplate.postForObject("http://47.108.20.251:5000/predictImg", requestEntity, String.class);
            String response = restTemplate.postForObject("http://127.0.0.1:5000/predictImg", requestEntity, String.class);
            System.out.println("Received response: " + response);
            JSONObject responses = JSONObject.parseObject(response);
            if(responses.get("status").equals(400)){
                return Result.error("-1", "Error: " + responses.get("message"));
            }else {
                ImgRecords imgRecords = new ImgRecords();
                imgRecords.setWeight(request.getWeight());
                imgRecords.setConf(request.getConf());
                imgRecords.setInputImg(request.getInputImg());
                imgRecords.setUsername(request.getUsername());
                imgRecords.setStartTime(request.getStartTime());
                imgRecords.setLabel(String.valueOf(responses.get("label")));
                imgRecords.setConfidence(String.valueOf(responses.get("confidence")));
                imgRecords.setAllTime(String.valueOf(responses.get("allTime")));
                imgRecords.setOutImg(String.valueOf(responses.get("outImg")));
                imgRecordsMapper.insert(imgRecords); // 插入到数据库
                return Result.success(response);
            }
        } catch (Exception e) {
            return Result.error("-1", "Error: " + e.getMessage());
        }
    }

    @GetMapping("/file_names")
    public Result<?> getFileNames() {
        try {
            // 调用 Flask API
            String response = restTemplate.getForObject("http://127.0.0.1:5000/file_names", String.class);
//            String response = restTemplate.getForObject("http://47.108.20.251:5000/file_names", String.class);
            return Result.success(response);
        } catch (Exception e) {
            return Result.error("-1", "Error: " + e.getMessage());
        }
    }

    /**
     * 实时检测：前端浏览器采集摄像头，逐帧 base64 提交；转发到 Flask，无需服务器挂载摄像头。
     */
    @PostMapping("/predictFrame")
    public Result<?> predictFrame(@RequestBody String rawBody) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(rawBody, headers);
//            String response = restTemplate.postForObject("http://47.108.20.251:5000/predictFrame", entity, String.class);
            String response = restTemplate.postForObject("http://127.0.0.1:5000/predictFrame", entity, String.class);
            return Result.success(response);
        } catch (Exception e) {
            return Result.error("-1", "Error: " + e.getMessage());
        }
    }

    /** 结束浏览器实时检测会话：Flask 转码上传并写入 cameraRecords */
    @PostMapping("/finalizeCameraSession")
    public Result<?> finalizeCameraSession(@RequestBody String rawBody) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(rawBody, headers);
//            String response = restTemplate.postForObject(
//                    "http://47.108.20.251:5000/finalizeCameraSession", entity, String.class);
            String response = restTemplate.postForObject(
                    "http://127.0.0.1:5000/finalizeCameraSession", entity, String.class);
            return Result.success(response);
        } catch (Exception e) {
            return Result.error("-1", "Error: " + e.getMessage());
        }
    }
}
