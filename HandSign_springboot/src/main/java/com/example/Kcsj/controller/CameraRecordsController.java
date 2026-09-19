package com.example.Kcsj.controller;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.Kcsj.common.Result;
import com.example.Kcsj.entity.CameraRecords;
import com.example.Kcsj.mapper.CameraRecordsMapper;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
@RestController
@RequestMapping("/cameraRecords")
public class CameraRecordsController {
    @Resource
    CameraRecordsMapper cameraRecordsMapper;


    @GetMapping("/all")
    public Result<?> GetAll(
            @RequestParam String role,          // 前端传递的角色（admin/user），必填
            @RequestParam(required = false) String username  // user角色时必填，admin可选
    ) {
        // 1. 校验角色参数不能为空
        if (StrUtil.isBlank(role)) {
            return Result.error("400", "角色参数role不能为空");
        }

        LambdaQueryWrapper<CameraRecords> wrapper = Wrappers.lambdaQuery();
        // 2. 角色判断：user角色只查自己的记录，admin查全部
        if ("user".equalsIgnoreCase(role)) {
            // user角色必须传username
            if (StrUtil.isBlank(username)) {
                return Result.error("400", "普通用户查询时必须传递username参数");
            }
            wrapper.eq(CameraRecords::getUsername, username); // 请确认实体类有getUsername方法
        } else if (!"admin".equalsIgnoreCase(role)) {
            // 角色参数不合法
            return Result.error("400", "角色参数不合法");
        }

        return Result.success(cameraRecordsMapper.selectList(wrapper));
    }
    @GetMapping("/{id}")
    public Result<?> getById(@PathVariable int id) {
        System.out.println(id);
        return Result.success(cameraRecordsMapper.selectById(id));
    }

    @GetMapping
    public Result<?> findPage(@RequestParam(defaultValue = "1") Integer pageNum,
                              @RequestParam(defaultValue = "10") Integer pageSize,
                              @RequestParam(defaultValue = "") String search,
                              @RequestParam(defaultValue = "") String search1,
                              @RequestParam(defaultValue = "") String search3,
                              @RequestParam(defaultValue = "") String search2) {
        LambdaQueryWrapper<CameraRecords> wrapper = Wrappers.<CameraRecords>lambdaQuery();
        wrapper.orderByDesc(CameraRecords::getStartTime);
        if (StrUtil.isNotBlank(search)) {
            wrapper.like(CameraRecords::getUsername, search);
        }
        if (StrUtil.isNotBlank(search1)) {
            wrapper.like(CameraRecords::getStartTime, search1);
        }
        if (StrUtil.isNotBlank(search2)) {
            wrapper.like(CameraRecords::getWeight, search2);
        }
        if (StrUtil.isNotBlank(search3)) {
            wrapper.like(CameraRecords::getConf, search3);
        }
        Page<CameraRecords> Page = cameraRecordsMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
        return Result.success(Page);
    }

    @DeleteMapping("/{id}")
    public Result<?> delete(@PathVariable int id) {
        cameraRecordsMapper.deleteById(id);
        return Result.success();
    }

    @PostMapping("/update")
    public Result<?> updates(@RequestBody CameraRecords cameraRecords) {
        cameraRecordsMapper.updateById(cameraRecords);
        return Result.success();
    }


    @PostMapping
    public Result<?> save(@RequestBody CameraRecords cameraRecords) {
        System.out.println(cameraRecords);
        cameraRecordsMapper.insert(cameraRecords);
        return Result.success();
    }
}
