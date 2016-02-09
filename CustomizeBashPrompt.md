# Just an example.
# BASH prompting /wiki play/

# Introduction #

I have such thing:
![http://azakharov.googlecode.com/svn-history/r14/branches/home/share/bash_prompt.png](http://azakharov.googlecode.com/svn-history/r14/branches/home/share/bash_prompt.png)

# Details #

For this you just need to override **BASH\_PROMPT** function in your profile file (~/.bashrc). I've shifted out prompting to separate file **~/.bash\_prompt** and in .bashrc just plugging it in like this:
```
[ -r ~/.bash_prompt ] && source ~/.bash_prompt
```

So, here is mine:
http://code.google.com/p/azakharov/source/browse/branches/home/.bash_prompt