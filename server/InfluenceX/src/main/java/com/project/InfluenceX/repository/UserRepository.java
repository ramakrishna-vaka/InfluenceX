package com.project.InfluenceX.repository;

import com.project.InfluenceX.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, String>
{

    List<User> findByName(String name);

    User findByEmail(String email);
}
