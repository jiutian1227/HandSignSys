package com.example.Kcsj.controller;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.Kcsj.common.Result;
import com.example.Kcsj.entity.User;
import com.example.Kcsj.mapper.UserMapper;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.time.LocalDate;
import java.util.Date;
import java.util.Objects;

@RestController
@RequestMapping("/user")
public class UserController {
    @Resource
    UserMapper userMapper;

    private String encryptPassword(String rawPassword) {
        return BCrypt.hashpw(rawPassword, BCrypt.gensalt());
    }

    private boolean checkPassword(String rawPassword, String encryptedPassword) {
        return BCrypt.checkpw(rawPassword, encryptedPassword);
    }

    @GetMapping
    public Result<?> findPage(@RequestParam(defaultValue = "1") Integer pageNum,
                              @RequestParam(defaultValue = "10") Integer pageSize,
                              @RequestParam(defaultValue = "") String search) {
        LambdaQueryWrapper<User> wrapper = Wrappers.<User>lambdaQuery();
        wrapper.orderByDesc(User::getId);
        if (StrUtil.isNotBlank(search)) {
            wrapper.like(User::getUsername, search);
        }
        Page<User> UserPage = userMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
        return Result.success(UserPage);
    }

    @GetMapping("/{username}")
    public Result<?> getByUsername(@PathVariable String username) {
        System.out.println(username);
        return Result.success(userMapper.selectByUsername(username));
    }

    @GetMapping("/all")
    public Result<?> GetAll() {
        return Result.success(userMapper.selectList(null));
    }

    @PostMapping("/login")
    public Result<?> login(@RequestBody User userParam) {
        System.out.println(userParam);
        try {
            User user = userMapper.selectByName(userParam.getUsername());
            if (checkPassword(userParam.getPassword(), user.getPassword())) {
                return Result.success(user);
            } else {
                return Result.error("-1", "密码错误！");
            }
        } catch (Exception e) {
            return Result.error("-1", "用户名不存在！");
        }
    }

    @PostMapping("/register")
    public Result<?> register(@RequestBody User user) {
        User res = userMapper.selectOne(Wrappers.<User>lambdaQuery().eq(User::getUsername, user.getUsername()));
        if (res != null) {
            return Result.error("-1", "用户名重复");
        }

        User user1 = new User();
        user1.setUsername(user.getUsername());
        user1.setPassword(encryptPassword(user.getPassword()));
        user1.setAvatar("https://img.tuxiangyan.com/uploads/allimg/230530/1_05300UH241a.jpg");
        user1.setRole("user");
        userMapper.insert(user1);
        return Result.success();
    }

    @PostMapping("/update")
    public Result<?> updates(@RequestBody User user) {
        if (StrUtil.isNotBlank(user.getPassword())) {
            user.setPassword(encryptPassword(user.getPassword()));
        }
        userMapper.updateById(user);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<?> delete(@PathVariable int id) {
        userMapper.deleteById(id);
        return Result.success();
    }

    @PostMapping
    public Result<?> save(@RequestBody User user) {
        if (StrUtil.isNotBlank(user.getPassword())) {
            user.setPassword(encryptPassword(user.getPassword()));
        }
        userMapper.insert(user);
        return Result.success();
    }
}